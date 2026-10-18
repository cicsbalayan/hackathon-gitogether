import { describe, expect, it } from "vitest"
import { recommendOutfitWithAi } from "../outfitStylist"
import {
  captureFetch,
  conversationConfig,
  inventory,
  outfitResponse,
} from "./fixtures"

describe("recommendOutfitWithAi", () => {
  it("returns grounded items for a valid response", async () => {
    const { fetchImpl } = captureFetch(
      outfitResponse({
        top: "TEE-BLK",
        bottom: "PANT-STN",
        footwear: "SNKR-WHT",
      }),
    )
    const result = await recommendOutfitWithAi(inventory, {
      config: conversationConfig,
      preferences: { size: "S" },
      fetchImpl,
    })
    expect(result.items.map((item) => item.sku)).toEqual([
      "TEE-BLK",
      "PANT-STN",
      "SNKR-WHT",
    ])
    expect(result.outfit).toEqual({
      Top: "TEE-BLK",
      Bottom: "PANT-STN",
      Footwear: "SNKR-WHT",
    })
    expect(result.warnings).toEqual([])
    expect(result.reasoning).toContain("Neutral")
  })

  it("sends anchor skus and preferences to the conversation model", async () => {
    const { fetchImpl, calls } = captureFetch(
      outfitResponse({ top: "TEE-BLK", bottom: "PANT-STN", footwear: "SNKR-WHT" }),
    )
    await recommendOutfitWithAi(inventory, {
      config: conversationConfig,
      preferences: { style: "Minimal", occasion: "Everyday" },
      anchorSkus: ["TEE-BLK"],
      fetchImpl,
    })
    const body = JSON.parse(String(calls[0].init.body))
    expect(body.model).toBe("gemini-2.5-flash")
    const userMessage = body.messages.find(
      (message: { role: string }) => message.role === "user",
    )
    expect(userMessage.content).toContain("TEE-BLK")
    expect(userMessage.content).toContain("Minimal")
    expect(userMessage.content).toContain("Everyday")
  })

  it("rejects hallucinated skus and drops them from the outfit", async () => {
    const { fetchImpl } = captureFetch(
      outfitResponse({
        top: "FAKE-SKU",
        bottom: "PANT-STN",
        footwear: "SNKR-WHT",
      }),
    )
    const result = await recommendOutfitWithAi(inventory, {
      config: conversationConfig,
      preferences: { size: "S" },
      fetchImpl,
    })
    expect(result.items.map((item) => item.sku)).toEqual(["PANT-STN", "SNKR-WHT"])
    expect(result.outfit.Top).toBeUndefined()
    expect(result.rejected).toContainEqual({ sku: "FAKE-SKU", reason: "unknown" })
    expect(result.warnings.join(" ")).toContain("FAKE-SKU")
  })

  it("excludes out-of-stock items and warns about the missing category", async () => {
    const { fetchImpl } = captureFetch(
      outfitResponse({
        top: "SOLD-OUT",
        bottom: "PANT-STN",
        footwear: "SNKR-WHT",
      }),
    )
    const result = await recommendOutfitWithAi(inventory, {
      config: conversationConfig,
      preferences: { size: "S" },
      fetchImpl,
    })
    expect(result.items.map((item) => item.sku)).toEqual(["PANT-STN", "SNKR-WHT"])
    expect(result.rejected).toContainEqual({
      sku: "SOLD-OUT",
      reason: "out-of-stock",
    })
    expect(result.warnings.join(" ")).toContain("Top")
  })

  it("skips the missing-category warning when a dress completes the look", async () => {
    const { fetchImpl } = captureFetch(
      outfitResponse({ dress: "TEE-BLK", footwear: "SNKR-WHT" }),
    )
    const result = await recommendOutfitWithAi(inventory, {
      config: conversationConfig,
      fetchImpl,
    })
    expect(
      result.warnings.some((warning) => warning.includes("missing")),
    ).toBe(false)
  })

  it("throws a config error when the api key is missing", async () => {
    const { fetchImpl } = captureFetch(outfitResponse({}))
    await expect(
      recommendOutfitWithAi(inventory, {
        config: { ...conversationConfig, apiKey: "" },
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: "config" })
  })

  it("throws a parse error for malformed JSON", async () => {
    const { fetchImpl } = captureFetch("not json")
    await expect(
      recommendOutfitWithAi(inventory, {
        config: conversationConfig,
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: "parse" })
  })
})
