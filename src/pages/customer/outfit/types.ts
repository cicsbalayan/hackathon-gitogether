import type { Dispatch, MutableRefObject, SetStateAction } from "react"
import type { Product } from "@/lib/catalogue"
import type { CartBundle, ShopView } from "../types"

export type OutfitPageProps = {
  products: Product[]
  image: string
  notify: (message: string) => void
  view: ShopView
  go: (view: ShopView) => void
  selected: Product[]
  setSelected: Dispatch<SetStateAction<Product[]>>
  isSelected: (product: Product) => boolean
  togglePiece: (product: Product) => void
  bundle: Product[]
  setBundle: Dispatch<SetStateAction<Product[]>>
  total: number
  error: string
  setError: (error: string) => void
  previewState: string
  setPreviewState: Dispatch<SetStateAction<string>>
  previewTimer: MutableRefObject<ReturnType<typeof setTimeout> | undefined>
  filtered: Product[]
  category: string
  setCategory: (category: string) => void
  collectionPage: number
  setCollectionPage: Dispatch<SetStateAction<number>>
  openProduct: (product: Product) => void
  detailProduct: Product | undefined
  cart: CartBundle[]
  cartTotal: number
  selectedCartItems: number
  selectedCartBundles: number
  money: (amount: number) => string
  bundleSubtotal: (entry: CartBundle, selectedOnly?: boolean) => number
  canAddBundle: (items: Product[]) => boolean
  changePieceQuantity: (id: string, sku: string, delta: number) => void
  selectCartPieces: (id: string, skus: string[]) => void
  removeBundle: (id: string) => void
  addCart: () => void
  addCartItem: (product: Product) => void
  swap: (product: Product, index: number) => void
  photos: string[]
  activePhoto: number | null
  setActivePhoto: (index: number | null) => void
  activeModelSrc: string | null
  removePhoto: (index: number) => void
  upload: MutableRefObject<HTMLInputElement | null>
  photoReco: { status: "idle" | "loading" | "error"; warnings: string[]; error: string; note: string }
  photoConfigured: boolean
  hasModelPhoto: boolean
  runAiRecommendation: () => void
  signedIn: boolean
  onRequireLogin: () => void
}
