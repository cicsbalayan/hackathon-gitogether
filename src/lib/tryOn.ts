import type { Product } from "./catalogue"
import { RecommendationError } from "./recommendation"
import type { ClothesChangerGarmentType, MagicHourConfig } from "./magicHour"
import {
  assertMagicHourConfigured,
  createClothesChanger,
  isMagicHourConfigured,
  readMagicHourConfig,
  uploadImageAsset,
  waitForImageProject,
} from "./magicHour"

/**
 * Virtual try-on through Magic Hour's AI Clothes Changer.
 *
 * The person photo and each garment are handed to the model, which returns a
 * newly generated photo of that person wearing the piece. Magic Hour swaps one
 * garment region per job, so an outfit becomes a small sequence of passes:
 * a top (upper body) and then bottoms (lower body), or a single entire-outfit
 * pass when a dress is selected. Each pass feeds its result into the next.
 */

export type TryOnPass = {
  sku: string
  garmentType: ClothesChangerGarmentType
}

export type TryOnPlan = {
  passes: TryOnPass[]
  skipped: Product[]
}

export type TryOnResult = {
  src: string
  skipped: Product[]
}

export type TryOnOptions = {
  personPhoto: string
  garments: Product[]
  signal?: AbortSignal
  onProgress?: (stage: string) => void
  config?: MagicHourConfig
  fetchImpl?: typeof fetch
}

export function isTryOnConfigured(
  env: ImportMetaEnv = import.meta.env,
): boolean {
  return isMagicHourConfigured(env)
}

/**
 * Which Magic Hour passes an outfit needs. A selected dress covers the whole
 * body, otherwise the top and bottom are swapped in turn; footwear and
 * accessories cannot be swapped and are reported as skipped.
 */
export function planTryOnPasses(garments: Product[]): TryOnPlan {
  const dress = garments.find((g) => g.category === "Dress")
  if (dress)
    return {
      passes: [{ sku: dress.sku, garmentType: "entire_outfit" }],
      skipped: garments.filter((g) => g.sku !== dress.sku),
    }
  const upper =
    garments.find((g) => g.category === "Top") ??
    garments.find((g) => g.category === "Outerwear")
  const lower = garments.find((g) => g.category === "Bottom")
  const passes: TryOnPass[] = []
  if (upper) passes.push({ sku: upper.sku, garmentType: "upper_body" })
  if (lower) passes.push({ sku: lower.sku, garmentType: "lower_body" })
  const used = new Set(passes.map((pass) => pass.sku))
  return { passes, skipped: garments.filter((g) => !used.has(g.sku)) }
}

/** Fetch an image (data URL or remote URL) and shrink it before uploading. */
async function fetchBlob(src: string, fetchImpl: typeof fetch): Promise<Blob> {
  const response = await fetchImpl(src)
  if (!response.ok)
    throw new RecommendationError(
      "network",
      "Could not read an image for the try-on.",
    )
  return response.blob()
}

async function downscale(blob: Blob, maxEdge: number): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(blob)
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    if (scale >= 1) {
      bitmap.close()
      return blob
    }
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext("2d")
    if (!context) {
      bitmap.close()
      return blob
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const output = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    )
    return output ?? blob
  } catch {
    return blob
  }
}

function blobToDataUrl(blob: Blob): Promise<string | null> {
  if (typeof FileReader === "undefined") return Promise.resolve(null)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(blob)
  })
}

/** Remote catalogue images go straight to Magic Hour; local ones are uploaded. */
async function garmentFilePath(
  config: MagicHourConfig,
  garment: Product,
  options: TryOnOptions,
  fetchImpl: typeof fetch,
): Promise<string> {
  if (!garment.imageUrl)
    throw new RecommendationError(
      "invalid-input",
      `${garment.name} has no image to fit. Pick another piece.`,
    )
  if (/^https?:\/\//i.test(garment.imageUrl)) return garment.imageUrl
  const blob = await downscale(
    await fetchBlob(garment.imageUrl, fetchImpl),
    1024,
  )
  return uploadImageAsset(config, blob, {
    signal: options.signal,
    fetchImpl,
  })
}

/** Hand a previous pass's output back to Magic Hour as the next person image. */
async function reuploadResult(
  config: MagicHourConfig,
  url: string,
  options: TryOnOptions,
  fetchImpl: typeof fetch,
): Promise<string> {
  try {
    const blob = await downscale(await fetchBlob(url, fetchImpl), 1536)
    return await uploadImageAsset(config, blob, {
      signal: options.signal,
      fetchImpl,
    })
  } catch {
    // Magic Hour can read its own download URLs, so pass it straight through.
    return url
  }
}

export async function generateTryOnImage(
  options: TryOnOptions,
): Promise<TryOnResult> {
  const config = options.config ?? readMagicHourConfig()
  assertMagicHourConfigured(config)
  if (!options.personPhoto)
    throw new RecommendationError(
      "invalid-input",
      "Pick or upload a model photo before generating a try-on.",
    )
  const plan = planTryOnPasses(options.garments)
  if (!plan.passes.length)
    throw new RecommendationError(
      "invalid-input",
      "AI try-on can swap a top, bottom or dress. Add one of those to the outfit.",
    )
  const fetchImpl = options.fetchImpl ?? fetch
  const bySku = new Map(options.garments.map((garment) => [garment.sku, garment]))

  options.onProgress?.("Uploading the model photo…")
  const personBlob = await downscale(
    await fetchBlob(options.personPhoto, fetchImpl),
    1536,
  )
  let personFilePath = await uploadImageAsset(config, personBlob, {
    signal: options.signal,
    fetchImpl,
  })

  let resultUrl = ""
  for (let index = 0; index < plan.passes.length; index += 1) {
    const pass = plan.passes[index]
    const garment = bySku.get(pass.sku)
    if (!garment) continue
    const filePath = await garmentFilePath(config, garment, options, fetchImpl)
    options.onProgress?.(
      plan.passes.length > 1
        ? `Fitting the ${garment.category.toLowerCase()} (${index + 1}/${plan.passes.length})…`
        : "Fitting the outfit…",
    )
    const id = await createClothesChanger(
      config,
      {
        personFilePath,
        garmentFilePath: filePath,
        garmentType: pass.garmentType,
        name: `Forma try-on · ${garment.name}`,
      },
      { signal: options.signal, fetchImpl },
    )
    resultUrl = await waitForImageProject(config, id, {
      signal: options.signal,
      fetchImpl,
      onStatus: (status) => {
        if (status === "queued") options.onProgress?.("Queued with Magic Hour…")
        else if (status === "rendering")
          options.onProgress?.("Rendering the try-on…")
      },
    })
    if (index < plan.passes.length - 1)
      personFilePath = await reuploadResult(
        config,
        resultUrl,
        options,
        fetchImpl,
      )
  }

  const outputBlob = await fetchBlob(resultUrl, fetchImpl).catch(() => null)
  const dataUrl = outputBlob ? await blobToDataUrl(outputBlob) : null
  return { src: dataUrl ?? resultUrl, skipped: plan.skipped }
}
