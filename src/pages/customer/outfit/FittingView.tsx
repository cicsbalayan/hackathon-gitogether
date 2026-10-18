import { Button, Heading } from "@/components/ui"
import { Icon } from "@/components/Icon"
import type { OutfitPageProps } from "./types"
import OutfitRows from "./OutfitRows"
import ModelCanvas from "./ModelCanvas"

export default function FittingView(props: OutfitPageProps) {
  const {
    image,
    go,
    selected,
    bundle,
    total,
    money,
    previewState,
    setPreviewState,
    previewTimer,
    photos,
    activePhoto,
    setActivePhoto,
    activeModelSrc,
    upload,
    swap,
    isSelected,
    signedIn,
    onRequireLogin,
  } = props
  if (!signedIn) {
    return (
      <section className="panel fitting-gate" aria-label="Sign in to try on">
        <Heading level={2}>Sign in to try on</Heading>
        <p className="shop-demo-note">
          Browse and chat with the stylist freely. Sign in to fit the look on a
          model.
        </p>
        <Button className="button primary" onClick={onRequireLogin}>
          Sign in
          <Icon name="arrow" />
        </Button>
      </section>
    )
  }
  return (
    <>
      <div className="outfit-context">
        <div className="outfit-context-pieces">
          <span className="outfit-context-label">Your selected pieces</span>
          <div className="outfit-piece-tags">
            {selected.map((p) => <span className="outfit-piece-tag" key={p.sku}>{p.name}</span>)}
          </div>
        </div>
        <Button className="button secondary outfit-context-edit" onClick={() => go("collection")}>
          Edit selection
          <Icon name="settings" />
        </Button>
      </div>
      <div className="studio-layout">
        <div className="fitting-model">
          <ModelCanvas
            image={image}
            activeModelSrc={activeModelSrc}
            bundle={bundle}
            total={total}
            money={money}
            previewState={previewState}
            label="Complete model · fitted preview"
            lookTitle="Fitted on model"
            lookLabel="Complete model with fitted clothing"
          />
        </div>
        <section className="outfit-tray">
          <Heading level={2}>Fit your look</Heading>
          <OutfitRows bundle={bundle} isSelected={isSelected} swap={swap} />
          <Button
            className="button primary full"
            disabled={previewState === "loading" || !bundle.length}
            onClick={() => {
              setPreviewState("loading")
              previewTimer.current = setTimeout(
                () => setPreviewState("ready"),
                1200,
              )
            }}
          >
            <Icon name="layers" />
            {previewState === "loading"
              ? "Preparing try-on…"
              : bundle.length
                ? `Virtual try-on · ${bundle.length} ${bundle.length === 1 ? "piece" : "pieces"}`
                : "Virtual try-on"}
          </Button>
          <p className="studio-disclaimer" role="status">
            {previewState === "ready"
              ? "Preview complete. Original image unchanged; no AI rendering."
              : "Optional local photo preview. Photos are not sent to a server."}
          </p>
          <div className="model-thumbs fitting-thumbs" aria-label="Choose a model">
            <button
              className={`model-thumb ${activePhoto === null ? "selected" : ""}`}
              onClick={() => setActivePhoto(null)}
              aria-pressed={activePhoto === null}
            >
              <img loading="lazy" decoding="async" src={image} alt="Default studio model" />
              <span>Studio</span>
            </button>
            {photos.map((src, i) => (
              <button key={src} className={`model-thumb ${activePhoto === i ? "selected" : ""}`}
                onClick={() => setActivePhoto(i)} aria-pressed={activePhoto === i}>
                <img loading="lazy" decoding="async" src={src} alt={`Uploaded model ${i + 1}`} />
                <span>Model {i + 1}</span>
              </button>
            ))}
            <button className="model-thumb model-upload" onClick={() => upload.current?.click()}>
              <Icon name="upload" />
              <span>Upload photo</span>
            </button>
          </div>
        </section>
      </div>
      <div className="checkout-dock blur-16">
        <small>{bundle.length} ITEMS</small>
        <div>
          <strong>{money(total)}</strong>
          <Button className="button primary" onClick={props.addCart}>
            <Icon name="bag" />
            Add to cart
          </Button>
        </div>
      </div>
    </>
  )
}
