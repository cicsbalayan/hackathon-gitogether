import type { Product } from "@/lib/catalogue"
import { Heading } from "@/components/ui"

export default function PairingGraph({ items }: { items: Product[] }) {
  if (items.length < 2) return null
  const width = Math.max(320, items.length * 150)
  const y = 46
  return (
    <section className="panel pairing-graph" aria-label="How these pieces pair">
      <div className="panel-header">
        <div>
          <Heading level={2}>Pairing graph</Heading>
          <p>How the recommendation pairs each piece with the next.</p>
        </div>
      </div>
      <div className="pairing-scroll">
        <svg viewBox={`0 0 ${width} 120`} width={width} height={120} role="img"
          aria-label={items.map((p) => p.name).join(", paired with ")}>
          {items.slice(0, -1).map((_, i) => (
            <line key={i} x1={75 + i * 150} y1={y} x2={75 + (i + 1) * 150} y2={y}
              stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="5 4" />
          ))}
          {items.map((p, i) => (
            <g key={p.sku}>
              <circle cx={75 + i * 150} cy={y} r={26} fill="var(--charcoal)" />
              <text x={75 + i * 150} y={y + 5} textAnchor="middle" fill="var(--surface)" fontSize={13} fontWeight={600}>
                {p.category.slice(0, 2).toUpperCase()}
              </text>
              <text x={75 + i * 150} y={y + 44} textAnchor="middle" fill="var(--muted)" fontSize={10}>
                {p.name.length > 20 ? `${p.name.slice(0, 20)}…` : p.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  )
}
