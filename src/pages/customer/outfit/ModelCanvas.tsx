import { useState } from "react"
import type { Product } from "@/lib/catalogue"
import { Garment } from "@/components/Icon"

type ModelCanvasProps = {
  image: string
  activeModelSrc: string | null
  bundle: Product[]
  total: number
  money: (amount: number) => string
  previewState: string
  label: string
  lookTitle: string
  lookLabel: string
}

/** Body zone for each category so the garment lands where it would be worn. */
const ZONE: Record<string, { top: string; left: string; width: string }> = {
  Top: { top: "20%", left: "28%", width: "44%" },
  Outerwear: { top: "18%", left: "24%", width: "52%" },
  Dress: { top: "22%", left: "27%", width: "46%" },
  Bottom: { top: "48%", left: "30%", width: "40%" },
  Footwear: { top: "80%", left: "32%", width: "36%" },
  Accessory: { top: "10%", left: "62%", width: "24%" },
}

function FittedGarment({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false)
  const zone = ZONE[product.category] ?? ZONE.Top
  return (
    <span className="fit-garment" style={zone} aria-hidden="true">
      {product.imageUrl && !failed ? (
        <img
          src={product.imageUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <Garment type={product.category} />
      )}
    </span>
  )
}

export default function ModelCanvas({
  image,
  activeModelSrc,
  bundle,
  total,
  money,
  previewState,
  label,
  lookTitle,
  lookLabel,
}: ModelCanvasProps) {
  return (
    <div className="fitting-canvas">
      <img
        loading="lazy"
        decoding="async"
        className={activeModelSrc ? "uploaded-model" : "full-body-model"}
        src={activeModelSrc || image}
        alt={
          activeModelSrc
            ? "Your uploaded model photo, not AI rendered"
            : "Full-body fashion model wearing a black dress, gold belt and heeled boots, not AI rendered"
        }
      />
      {bundle.length > 0 && (
        <div className="fit-garments" aria-label="Garments fitted on the model">
          {bundle.map((p) => (
            <FittedGarment key={p.sku} product={p} />
          ))}
        </div>
      )}
      <span className="canvas-label">{label}</span>
      {bundle.length > 0 && (
        <div className="complete-look" aria-label={lookLabel}>
          <strong>
            {lookTitle} · {bundle.length} {bundle.length === 1 ? "piece" : "pieces"} · {money(total)}
          </strong>
          <div>
            {bundle.map((p) => (
              <span key={p.sku} className="complete-chip">{p.category} · {p.name}</span>
            ))}
          </div>
        </div>
      )}
      {previewState === "loading" && (
        <div className="try-on-loading" role="status" aria-live="polite">
          <div className="try-on-orb" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <strong>Preparing your try-on…</strong>
          <span>Building a glass preview of your look.</span>
        </div>
      )}
    </div>
  )
}
