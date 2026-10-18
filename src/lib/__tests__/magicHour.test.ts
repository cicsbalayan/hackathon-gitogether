import { describe, expect, it } from "vitest"
import {
  createClothesChanger,
  extensionForMime,
  getImageProject,
  isMagicHourConfigured,
  readMagicHourConfig,
  uploadImageAsset,
  waitForImageProject,
} from "../magicHour"
import { apiResponse } from "./fixtures"

const env = (values: Record<string, string>): ImportMetaEnv =>
  values as unknown as ImportMetaEnv

const config = { apiKey: "mhk_test", baseUrl: "https://api.test" }

function sequenceFetch(responses: Response[]): {
  fetchImpl: typeof fetch
  calls: { url: string; init: RequestInit }[]
} {
  const calls: { url: string; init: RequestInit }[] = []
  let index = 0
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} })
    const response = responses[Math.min(index, responses.length - 1)]
    index += 1
    return response
  }) as typeof fetch
  return { fetchImpl, calls }
}

describe("Magic Hour config", () => {
  it("reads and trims the API key", () => {
    expect(readMagicHourConfig(env({ VITE_MAGIC_API: " mhk_live_x " }))).toEqual({
      apiKey: "mhk_live_x",
      baseUrl: "https://api.magichour.ai",
    })
  })

  it("is only configured with a key", () => {
    expect(isMagicHourConfigured(env({ VITE_MAGIC_API: "mhk" }))).toBe(true)
    expect(isMagicHourConfigured(env({}))).toBe(false)
    expect(isMagicHourConfigured(env({ VITE_MAGIC_API: "  " }))).toBe(false)
  })
})

describe("extensionForMime", () => {
  it("maps image mime types to extensions", () => {
    expect(extensionForMime("image/png")).toBe("png")
    expect(extensionForMime("image/webp")).toBe("webp")
    expect(extensionForMime("image/jpeg")).toBe("jpg")
    expect(extensionForMime("")).toBe("jpg")
  })
})

describe("uploadImageAsset", () => {
  it("requests an upload url then PUTs the blob", async () => {
    const { fetchImpl, calls } = sequenceFetch([
      apiResponse({
        items: [
          {
            upload_url: "https://upload.test/asset.png?sig=1",
            file_path: "api-assets/id/asset.png",
          },
        ],
      }),
      apiResponse({}),
    ])
    const blob = new Blob(["bytes"], { type: "image/png" })
    const filePath = await uploadImageAsset(config, blob, { fetchImpl })
    expect(filePath).toBe("api-assets/id/asset.png")
    expect(calls[0].url).toBe("https://api.test/v1/files/upload-urls")
    expect(
      (calls[0].init.headers as Record<string, string>).Authorization,
    ).toBe("Bearer mhk_test")
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      items: [{ type: "image", extension: "png" }],
    })
    expect(calls[1].url).toBe("https://upload.test/asset.png?sig=1")
    expect(calls[1].init.method).toBe("PUT")
    expect(calls[1].init.body).toBe(blob)
  })

  it("fails when no upload url comes back", async () => {
    const { fetchImpl } = sequenceFetch([apiResponse({ items: [] })])
    await expect(
      uploadImageAsset(config, new Blob(["x"]), { fetchImpl }),
    ).rejects.toMatchObject({ code: "parse" })
  })

  it("surfaces the upload failure status", async () => {
    const { fetchImpl } = sequenceFetch([
      apiResponse({
        items: [{ upload_url: "https://upload.test/a.png", file_path: "a.png" }],
      }),
      apiResponse({}, { ok: false, status: 500 }),
    ])
    await expect(
      uploadImageAsset(config, new Blob(["x"]), { fetchImpl }),
    ).rejects.toThrow(/HTTP 500/)
  })
})

describe("createClothesChanger", () => {
  it("posts the assets and returns the project id", async () => {
    const { fetchImpl, calls } = sequenceFetch([apiResponse({ id: "cuid-1" })])
    const id = await createClothesChanger(
      config,
      {
        personFilePath: "api-assets/id/model.png",
        garmentFilePath: "https://example.com/tee.jpg",
        garmentType: "upper_body",
      },
      { fetchImpl },
    )
    expect(id).toBe("cuid-1")
    expect(calls[0].url).toBe("https://api.test/v1/ai-clothes-changer")
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      name: "Forma virtual try-on",
      assets: {
        person_file_path: "api-assets/id/model.png",
        garment_file_path: "https://example.com/tee.jpg",
        garment_type: "upper_body",
      },
    })
  })

  it("explains an exhausted account", async () => {
    const { fetchImpl } = sequenceFetch([
      apiResponse({ message: "Payment required" }, { ok: false, status: 402 }),
    ])
    await expect(
      createClothesChanger(
        config,
        {
          personFilePath: "p",
          garmentFilePath: "g",
          garmentType: "upper_body",
        },
        { fetchImpl },
      ),
    ).rejects.toThrow(/credits are exhausted/)
  })

  it("treats a rejected key as a config error", async () => {
    const { fetchImpl } = sequenceFetch([
      apiResponse({ message: "Unauthorized" }, { ok: false, status: 401 }),
    ])
    await expect(
      createClothesChanger(
        config,
        {
          personFilePath: "p",
          garmentFilePath: "g",
          garmentType: "upper_body",
        },
        { fetchImpl },
      ),
    ).rejects.toMatchObject({ code: "config" })
  })
})

describe("getImageProject", () => {
  it("normalizes the project response", async () => {
    const { fetchImpl, calls } = sequenceFetch([
      apiResponse({
        id: "cuid-1",
        status: "complete",
        downloads: [{ url: "https://out.test/1.png", expires_at: "later" }],
        error: null,
      }),
    ])
    const project = await getImageProject(config, "cuid-1", { fetchImpl })
    expect(project).toEqual({
      id: "cuid-1",
      status: "complete",
      downloads: [{ url: "https://out.test/1.png", expires_at: "later" }],
      error: null,
    })
    expect(calls[0].url).toBe("https://api.test/v1/image-projects/cuid-1")
    expect(calls[0].init.method).toBe("GET")
  })
})

describe("waitForImageProject", () => {
  const sleep = async () => {}

  it("polls until the project completes", async () => {
    const { fetchImpl, calls } = sequenceFetch([
      apiResponse({ id: "x", status: "queued", downloads: [], error: null }),
      apiResponse({
        id: "x",
        status: "complete",
        downloads: [{ url: "https://out.test/final.png" }],
        error: null,
      }),
    ])
    const statuses: string[] = []
    const url = await waitForImageProject(config, "x", {
      fetchImpl,
      sleepImpl: sleep,
      onStatus: (status) => statuses.push(status),
    })
    expect(url).toBe("https://out.test/final.png")
    expect(statuses).toEqual(["queued", "complete"])
    expect(calls).toHaveLength(2)
  })

  it("reports the renderer error message", async () => {
    const { fetchImpl } = sequenceFetch([
      apiResponse({
        id: "x",
        status: "error",
        downloads: [],
        error: {
          code: "no_face",
          message: "Please use an image with a detectable face",
        },
      }),
    ])
    await expect(
      waitForImageProject(config, "x", { fetchImpl, sleepImpl: sleep }),
    ).rejects.toThrow(/detectable face/)
  })

  it("times out while still rendering", async () => {
    const { fetchImpl } = sequenceFetch([
      apiResponse({ id: "x", status: "rendering", downloads: [], error: null }),
    ])
    await expect(
      waitForImageProject(config, "x", {
        fetchImpl,
        sleepImpl: sleep,
        timeoutMs: 0,
      }),
    ).rejects.toMatchObject({ code: "timeout" })
  })
})
