import { describe, expect, it } from "vitest"
import type { Product } from "../catalogue"
import {
  generateTryOnImage,
  isTryOnConfigured,
  planTryOnPasses,
} from "../tryOn"
import { inventory } from "./fixtures"

const env = (values: Record<string, string>): ImportMetaEnv =>
  values as unknown as ImportMetaEnv

const config = { apiKey: "mhk_test", baseUrl: "https://api.test" }

function product(overrides: Partial<Product> & { sku: string }): Product {
  return {
    name: overrides.sku,
    category: "Top",
    price: 1000,
    stock: 5,
    ...overrides,
  } as Product
}

const tee = inventory.find((p) => p.sku === "TEE-BLK")!
const trousers = inventory.find((p) => p.sku === "PANT-STN")!
const sneakers = inventory.find((p) => p.sku === "SNKR-WHT")!
const dress = product({ sku: "GOWN", name: "Satin gown", category: "Dress" })
const coat = product({ sku: "COAT", name: "Wool coat", category: "Outerwear" })

describe("isTryOnConfigured", () => {
  it("follows the Magic Hour key", () => {
    expect(isTryOnConfigured(env({ VITE_MAGIC_API: "mhk_live" }))).toBe(true)
    expect(isTryOnConfigured(env({}))).toBe(false)
  })
})

describe("planTryOnPasses", () => {
  it("swaps the whole outfit for a dress and skips the rest", () => {
    const plan = planTryOnPasses([dress, tee, sneakers])
    expect(plan.passes).toEqual([{ sku: "GOWN", garmentType: "entire_outfit" }])
    expect(plan.skipped.map((p) => p.sku)).toEqual(["TEE-BLK", "SNKR-WHT"])
  })

  it("swaps the top first, then the bottom, on one person", () => {
    const plan = planTryOnPasses([trousers, tee, sneakers])
    expect(plan.passes).toEqual([
      { sku: "TEE-BLK", garmentType: "upper_body" },
      { sku: "PANT-STN", garmentType: "lower_body" },
    ])
    expect(plan.skipped.map((p) => p.sku)).toEqual(["SNKR-WHT"])
  })

  it("prefers a top over outerwear for the upper body", () => {
    const plan = planTryOnPasses([coat, tee])
    expect(plan.passes).toEqual([{ sku: "TEE-BLK", garmentType: "upper_body" }])
    expect(plan.skipped.map((p) => p.sku)).toEqual(["COAT"])
  })

  it("uses outerwear when no top is selected", () => {
    const plan = planTryOnPasses([coat])
    expect(plan.passes).toEqual([{ sku: "COAT", garmentType: "upper_body" }])
  })

  it("has no passes for footwear and accessories only", () => {
    const plan = planTryOnPasses([
      sneakers,
      product({ sku: "BAG", category: "Accessory" }),
    ])
    expect(plan.passes).toEqual([])
    expect(plan.skipped).toHaveLength(2)
  })
})

describe("generateTryOnImage", () => {
  it("requires the Magic Hour key", async () => {
    await expect(
      generateTryOnImage({
        personPhoto: "data:image/png;base64,AAAA",
        garments: [tee],
        config: { apiKey: "", baseUrl: "https://api.test" },
      }),
    ).rejects.toMatchObject({ code: "config" })
  })

  it("requires a model photo", async () => {
    await expect(
      generateTryOnImage({ personPhoto: "", garments: [tee], config }),
    ).rejects.toMatchObject({ code: "invalid-input" })
  })

  it("rejects an outfit with nothing the model can swap", async () => {
    await expect(
      generateTryOnImage({
        personPhoto: "data:image/png;base64,AAAA",
        garments: [sneakers],
        config,
      }),
    ).rejects.toMatchObject({ code: "invalid-input" })
  })
})
