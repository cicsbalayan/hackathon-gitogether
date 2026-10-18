import { productColor } from "@/lib/catalogue"
import { Button, Heading, Input } from "@/components/ui"
import { Icon, Garment } from "@/components/Icon"
import ProductImage from "@/components/ProductImage"
import type { OutfitPageProps } from "./types"

export default function CartView(props: OutfitPageProps) {
  const {
    go,
    cart,
    cartTotal,
    selectedCartItems,
    selectedCartBundles,
    money,
    bundleSubtotal,
    canAddBundle,
    changePieceQuantity,
    selectCartPieces,
    removeBundle,
  } = props
  return (
    <section className={`shop-cart ${selectedCartItems ? "" : "without-summary"}`}>
      {cart.length ? (
        <>
          <div className="cart-bundles">
            {cart.map((entry, index) => (
              <section className="cart-bundle" key={entry.id}>
                <div className="cart-bundle-heading">
                  <Input
                    type="checkbox"
                    className="cart-checkbox"
                    aria-label={`Select all pieces in outfit ${index + 1}`}
                    checked={entry.selectedSkus.length === entry.items.length}
                    ref={(input) => {
                      if (input) input.indeterminate = entry.selectedSkus.length > 0 && entry.selectedSkus.length < entry.items.length
                    }}
                    onChange={(e) => selectCartPieces(entry.id, e.target.checked ? entry.items.map((p) => p.sku) : [])}
                  />
                  <div>
                    <Heading level={2}>{entry.items.length === 1 ? `Item ${index + 1}` : `Outfit ${index + 1}`}</Heading>
                    <small>{entry.style} · {entry.occasion} · {entry.items.length} {entry.items.length === 1 ? "piece" : "pieces"}</small>
                  </div>
                  <Button className="icon-button" aria-label={`Remove outfit ${index + 1}`} onClick={() => removeBundle(entry.id)}>
                    <Icon name="trash" />
                  </Button>
                </div>
                <div className="cart-items">
                  {entry.items.map((p) => (
                    <div className="cart-item" key={p.sku}>
                      <Input
                        type="checkbox"
                        className="cart-checkbox"
                        aria-label={`Select ${p.name} in outfit ${index + 1}`}
                        checked={entry.selectedSkus.includes(p.sku)}
                        onChange={(e) => selectCartPieces(entry.id, e.target.checked
                          ? [...entry.selectedSkus, p.sku]
                          : entry.selectedSkus.filter((sku) => sku !== p.sku))}
                      />
                      <div className="studio-item-image">
                        <ProductImage product={p} Garment={Garment} />
                      </div>
                      <div>
                        <strong>{p.name}</strong>
                        <small>
                          {productColor(p)} · {money(p.price)} each
                        </small>
                      </div>
                      <div className="cart-piece-controls">
                        <div className="bundle-quantity">
                          <Button className="icon-button" aria-label={`Decrease ${p.name} quantity in outfit ${index + 1}`} disabled={entry.quantities[p.sku] === 1} onClick={() => changePieceQuantity(entry.id, p.sku, -1)}>−</Button>
                          <strong aria-live="polite">{entry.quantities[p.sku]}</strong>
                          <Button className="icon-button" aria-label={`Increase ${p.name} quantity in outfit ${index + 1}`} disabled={!canAddBundle([p])} onClick={() => changePieceQuantity(entry.id, p.sku, 1)}><Icon name="plus" /></Button>
                        </div>
                        <strong>{money(p.price * entry.quantities[p.sku])}</strong>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-bundle-footer">
                  <span>Bundle subtotal</span>
                  <strong>{money(bundleSubtotal(entry))}</strong>
                </div>
              </section>
            ))}
          </div>
          {selectedCartItems > 0 && <aside className="cart-summary">
            <Heading level={2}>Order summary</Heading>
            <div className="cart-summary-counts"><span>From {selectedCartBundles} {selectedCartBundles === 1 ? "outfit" : "outfits"}</span><span>{selectedCartItems} selected pieces</span></div>
            <div>
              <span>Subtotal</span>
              <strong>{money(cartTotal)}</strong>
            </div>
            <p>Shipping and taxes will be calculated by the retailer.</p>
            <Button className="button primary full" disabled>
              Retailer checkout unavailable
            </Button>
          </aside>}
        </>
      ) : (
        <div className="empty">
          <Heading level={2}>Your cart is empty</Heading>
          <Button
            className="button primary"
            onClick={() => go("collection")}
          >
            Browse the collection
            <Icon name="arrow" />
          </Button>
        </div>
      )}
    </section>
  )
}
