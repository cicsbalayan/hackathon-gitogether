import { Heading } from "@/components/ui"
import type { OutfitPageProps } from "./outfit/types"
import BuilderView from "./outfit/BuilderView"
import ProductDetailView from "./outfit/ProductDetailView"
import CartView from "./outfit/CartView"
import FittingView from "./outfit/FittingView"

export type { OutfitPageProps }

export default function OutfitPage(props: OutfitPageProps) {
  const { view } = props
  return (
    <>
      <div className="customer-intro">
        <Heading level={1}>
          {view === "collection"
            ? "Outfit builder"
            : view === "product"
              ? "Product details"
              : view === "cart"
                ? "Your cart"
                : "Fitting studio"}
        </Heading>
      </div>
      {view === "collection" && <BuilderView {...props} />}
      {view === "product" && <ProductDetailView {...props} />}
      {view === "cart" && <CartView {...props} />}
      {view === "fitting" && <FittingView {...props} />}
    </>
  )
}
