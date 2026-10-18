import type { Product } from "@/lib/catalogue"
import { productColor } from "@/lib/catalogue"
import { Button } from "@/components/ui"
import { Icon, Garment } from "@/components/Icon"
import ProductImage from "@/components/ProductImage"

type OutfitRowsProps = {
  bundle: Product[]
  isSelected: (product: Product) => boolean
  swap: (product: Product, index: number) => void
}

export default function OutfitRows({ bundle, isSelected, swap }: OutfitRowsProps) {
  return (
    <div className="outfit-items">
      {bundle.map((p, index) => (
        <div className="studio-item" key={p.sku}>
          <div className="studio-item-image">
            <ProductImage product={p} Garment={Garment} />
          </div>
          <div>
            <span className="tiny-label">
              {p.category}
              {isSelected(p) ? " · Your selection" : ""}
            </span>
            <strong>{p.name}</strong>
            <small>{productColor(p)} · {p.stock} catalogue units</small>
            <span className="item-price">₱{p.price.toFixed(2)}</span>
          </div>
          <Button
            className="icon-button"
            aria-label={`Swap ${p.name}`}
            onClick={() => swap(p, index)}
          >
            <Icon name="swap" />
            <span>Swap</span>
          </Button>
        </div>
      ))}
    </div>
  )
}
