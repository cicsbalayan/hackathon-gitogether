import { RecommendationError } from "./recommendation"

/**
 * Magic Hour REST client for the browser.
 *
 * The published `magic-hour` SDK is Node-only (it reads local files and writes
 * downloads to disk), so the app talks to the same REST API directly: upload
 * the images, create an AI Clothes Changer job, then poll the image project
 * until it finishes. Every request is a plain fetch, which keeps the module
 * testable through an injected `fetchImpl`.
 */

export const MAGIC_HOUR_BASE_URL = "https://api.magichour.ai"

export const CLOTHES_CHANGER_TYPES = [
  "entire_outfit",
  "upper_body",
  "lower_body",
] as const
export type ClothesChangerGarmentType = (typeof CLOTHES_CHANGER_TYPES)[number]

export type MagicHourConfig = {
  apiKey: string
  baseUrl: string
}

export type ImageProjectStatus =
  | "draft"
  | "queued"
  | "rendering"
  | "complete"
  | "error"
  | "canceled"

export type ImageProject = {
  id: string
  status: ImageProjectStatus
  downloads: { url: string; expires_at: string }[]
  error: { message: string; code: string } | null
}

export type RequestOptions = {
  signal?: AbortSignal
  fetchImpl?: typeof fetch
}

const POLL_INTERVAL_MS = 4000
export const DEFAULT_PROJECT_TIMEOUT_MS = 240000

export function readMagicHourConfig(
  env: ImportMetaEnv = import.meta.env,
): MagicHourConfig {
  return {
    apiKey: (env.VITE_MAGIC_API || "").trim(),
    baseUrl: MAGIC_HOUR_BASE_URL,
  }
}

export function isMagicHourConfigured(
  env: ImportMetaEnv = import.meta.env,
): boolean {
  return Boolean(readMagicHourConfig(env).apiKey)
}

export function assertMagicHourConfigured(config: MagicHourConfig): void {
  if (!config.apiKey)
    throw new RecommendationError(
      "config",
      "AI try-on needs VITE_MAGIC_API (a Magic Hour key) in .env.",
    )
}

export function extensionForMime(mime: string): string {
  const normalized = (mime || "").toLowerCase()
  if (normalized.includes("png")) return "png"
  if (normalized.includes("webp")) return "webp"
  return "jpg"
}

function errorDetail(payload: unknown): string {
  if (!payload || typeof payload !== "object") return ""
  const record = payload as {
    message?: unknown
    error?: { message?: unknown }
  }
  if (typeof record.message === "string") return record.message
  if (typeof record.error?.message === "string") return record.error.message
  return ""
}

function failure(response: Response, payload: unknown): RecommendationError {
  if (response.status === 401 || response.status === 403)
    return new RecommendationError(
      "config",
      "Magic Hour rejected the API key. Check VITE_MAGIC_API in .env.",
    )
  if (response.status === 402)
    return new RecommendationError(
      "http",
      "Magic Hour credits are exhausted, so the try-on could not be generated.",
    )
  if (response.status === 429)
    return new RecommendationError(
      "http",
      "Magic Hour is rate limiting requests. Try again in a moment.",
    )
  return new RecommendationError(
    "http",
    errorDetail(payload) || `Magic Hour request failed (HTTP ${response.status}).`,
  )
}

async function callJson(
  url: string,
  init: RequestInit,
  fetchImpl: typeof fetch,
): Promise<unknown> {
  let response: Response
  try {
    response = await fetchImpl(url, init)
  } catch (cause) {
    throw new RecommendationError(
      "network",
      cause instanceof Error && cause.message
        ? `Could not reach Magic Hour: ${cause.message}`
        : "Could not reach Magic Hour. Check your connection and try again.",
    )
  }
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw failure(response, payload)
  return payload
}

function authorizedJson(config: MagicHourConfig, body: unknown): RequestInit {
  return {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  }
}

/** Ask Magic Hour for a signed URL, then PUT the bytes to it. */
export async function uploadImageAsset(
  config: MagicHourConfig,
  blob: Blob,
  options: RequestOptions = {},
): Promise<string> {
  assertMagicHourConfigured(config)
  const fetchImpl = options.fetchImpl ?? fetch
  const slots = (await callJson(
    `${config.baseUrl}/v1/files/upload-urls`,
    {
      ...authorizedJson(config, {
        items: [{ type: "image", extension: extensionForMime(blob.type) }],
      }),
      signal: options.signal,
    },
    fetchImpl,
  )) as { items?: { upload_url?: string; file_path?: string }[] } | null
  const slot = slots?.items?.[0]
  if (!slot?.upload_url || !slot.file_path)
    throw new RecommendationError(
      "parse",
      "Magic Hour did not return an upload URL for the image.",
    )
  let upload: Response
  try {
    upload = await fetchImpl(slot.upload_url, {
      method: "PUT",
      headers: { "Content-Type": blob.type || "application/octet-stream" },
      body: blob,
      signal: options.signal,
    })
  } catch (cause) {
    throw new RecommendationError(
      "network",
      cause instanceof Error && cause.message
        ? `Uploading the image failed: ${cause.message}`
        : "Uploading the image to Magic Hour failed.",
    )
  }
  if (!upload.ok)
    throw new RecommendationError(
      "http",
      `Uploading the image to Magic Hour failed (HTTP ${upload.status}).`,
    )
  return slot.file_path
}

/** Queue an AI Clothes Changer job and return its project id. */
export async function createClothesChanger(
  config: MagicHourConfig,
  input: {
    personFilePath: string
    garmentFilePath: string
    garmentType: ClothesChangerGarmentType
    name?: string
  },
  options: RequestOptions = {},
): Promise<string> {
  assertMagicHourConfigured(config)
  const payload = (await callJson(
    `${config.baseUrl}/v1/ai-clothes-changer`,
    {
      ...authorizedJson(config, {
        name: input.name || "Forma virtual try-on",
        assets: {
          person_file_path: input.personFilePath,
          garment_file_path: input.garmentFilePath,
          garment_type: input.garmentType,
        },
      }),
      signal: options.signal,
    },
    options.fetchImpl ?? fetch,
  )) as { id?: string } | null
  if (!payload?.id)
    throw new RecommendationError(
      "parse",
      "Magic Hour accepted the try-on but returned no project id.",
    )
  return payload.id
}

export async function getImageProject(
  config: MagicHourConfig,
  id: string,
  options: RequestOptions = {},
): Promise<ImageProject> {
  assertMagicHourConfigured(config)
  const payload = (await callJson(
    `${config.baseUrl}/v1/image-projects/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/json",
      },
      signal: options.signal,
    },
    options.fetchImpl ?? fetch,
  )) as Partial<ImageProject> | null
  return {
    id: payload?.id ?? id,
    status: payload?.status ?? "queued",
    downloads: Array.isArray(payload?.downloads) ? payload.downloads : [],
    error: payload?.error ?? null,
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer)
        resolve()
      },
      { once: true },
    )
  })
}

export type WaitOptions = RequestOptions & {
  intervalMs?: number
  timeoutMs?: number
  onStatus?: (status: ImageProjectStatus) => void
  sleepImpl?: (ms: number, signal?: AbortSignal) => Promise<void>
}

/** Poll an image project until it completes and return the download URL. */
export async function waitForImageProject(
  config: MagicHourConfig,
  id: string,
  options: WaitOptions = {},
): Promise<string> {
  const interval = options.intervalMs ?? POLL_INTERVAL_MS
  const timeout = options.timeoutMs ?? DEFAULT_PROJECT_TIMEOUT_MS
  const sleep = options.sleepImpl ?? delay
  const deadline = Date.now() + timeout
  for (;;) {
    if (options.signal?.aborted)
      throw new RecommendationError("timeout", "The try-on was cancelled.")
    const project = await getImageProject(config, id, options)
    options.onStatus?.(project.status)
    if (project.status === "complete") {
      const url = project.downloads[0]?.url
      if (url) return url
      throw new RecommendationError(
        "parse",
        "Magic Hour finished the try-on without a download URL.",
      )
    }
    if (project.status === "error")
      throw new RecommendationError(
        "http",
        project.error?.message || "Magic Hour could not generate the try-on.",
      )
    if (project.status === "canceled")
      throw new RecommendationError(
        "http",
        "The Magic Hour try-on was cancelled.",
      )
    if (Date.now() >= deadline)
      throw new RecommendationError(
        "timeout",
        "The try-on timed out. Try fewer pieces or a smaller photo.",
      )
    await sleep(interval, options.signal)
  }
}
