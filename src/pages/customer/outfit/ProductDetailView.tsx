import { productColor } from "@/lib/catalogue"
import { Button, Heading } from "@/components/ui"
import { Icon, Garment } from "@/components/Icon"
import ProductImage from "@/components/ProductImage"
import type { OutfitPageProps } from "./types"

export default function ProductDetailView(props: OutfitPageProps) {
  const {
    go,
    selected,
    setSelected,
    isSelected,
    togglePiece,
    bundle,
    setBundle,
    error,
    setError,
    setPreviewState,
    detailProduct,
    notify,
    addCartItem,
    signedIn,
    onRequireLogin,
  } = props
  const openFitting = () => {
    if (!signedIn) {
      onRequireLogin()
      return
    }
    go("fitting")
  }
  return (
    <>
      <Button className="text-button product-back" onClick={() => go("collection")}>
        Back to collection
      </Button>
      {detailProduct ? (
        <section className="product-detail-layout">
          <div className="product-detail-art">
            <ProductImage product={detailProduct} Garment={Garment} />
          </div>
          <div className="product-detail-info">
            <span className="eyebrow">{detailProduct.category}</span>
            <Heading level={2}>{detailProduct.name}</Heading>
            <strong className="product-detail-price">₱{detailProduct.price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</strong>
            <p>Build your look around this piece, or pair it with complementary items from the collection.</p>
            <dl className="product-specifications">
              <div><dt>Color</dt><dd>{productColor(detailProduct)}</dd></div>
              <div><dt>Product code</dt><dd>{detailProduct.sku}</dd></div>
              <div><dt>Availability</dt><dd>{detailProduct.stock ? `${detailProduct.stock} units available` : "Out of stock"}</dd></div>
            </dl>
            <Button
              className={`button ${isSelected(detailProduct) ? "secondary" : "primary"} full`}
              disabled={!isSelected(detailProduct) && !detailProduct.stock}
              onClick={() => {
                togglePiece(detailProduct)
                notify(isSelected(detailProduct) ? "Piece removed from your outfit." : "Piece added to your outfit.")
              }}
            >
              <Icon name={isSelected(detailProduct) ? "close" : "plus"} />
              {isSelected(detailProduct) ? "Remove from outfit" : "Add to outfit"}
            </Button>
            <Button className="button secondary full"
              disabled={!detailProduct.stock}
              onClick={() => addCartItem(detailProduct)}
            >
              <Icon name="bag" />
              Add this piece to cart
            </Button>
            <Button className="button secondary full"
              disabled={!detailProduct.stock}
              onClick={() => {
                setSelected([detailProduct])
                setBundle([detailProduct])
                setError("")
                setPreviewState("idle")
                openFitting()
              }}>
              Fit this piece <Icon name="arrow" />
            </Button>
            {error && <p className="shop-error" role="alert">{error}</p>}
            <Button className="button secondary full" onClick={() => go("collection")}>
              {selected.length ? `Style my ${selected.length} selected pieces` : "Continue shopping"}
              <Icon name="arrow" />
            </Button>
            <small className="shop-demo-note">Add pieces, then the builder recommends the rest of your look.</small>
          </div>
        </section>
      ) : (
        <div className="empty"><Heading level={2}>This product is no longer available</Heading></div>
      )}
    </>
  )
}
