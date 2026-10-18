import type { Product } from "@/lib/catalogue"
import { productColor } from "@/lib/catalogue"
import { classificationCategories } from "@/lib/classification"
import { Button, Heading } from "@/components/ui"
import { Icon, Garment } from "@/components/Icon"
import ProductImage from "@/components/ProductImage"
import type { OutfitPageProps } from "./types"
import PairingGraph from "./PairingGraph"
import OutfitRows from "./OutfitRows"
import ModelCanvas from "./ModelCanvas"

export default function BuilderView(props: OutfitPageProps) {
  const {
    products,
    image,
    go,
    selected,
    setSelected,
    isSelected,
    togglePiece,
    bundle,
    setBundle,
    total,
    error,
    setError,
    previewState,
    setPreviewState,
    previewTimer,
    tryOnStage,
    tryOnImage,
    tryOnConfigured,
    runTryOn,
    filtered,
    category,
    setCategory,
    collectionPage,
    setCollectionPage,
    openProduct,
    addCart,
    addCartItem,
    swap,
    photos,
    activePhoto,
    setActivePhoto,
    activeModelSrc,
    removePhoto,
    upload,
    photoReco,
    photoConfigured,
    hasModelPhoto,
    runAiRecommendation,
    signedIn,
    onRequireLogin,
  } = props
  const openFitting = () => {
    if (!signedIn) {
      onRequireLogin()
      return
    }
    if (!bundle.length && selected.length) {
      setBundle(selected)
    }
    go("fitting")
  }
  const collectionPages = Math.max(1, Math.ceil(filtered.length / 4))
  const availableCategories = classificationCategories.filter((c) =>
    products.some((p) => p.category === c),
  )
  return (
    <div className="builder-studio">
      <div className="builder-model">
        <ModelCanvas
          image={image}
          activeModelSrc={activeModelSrc}
          bundle={bundle}
          total={total}
          money={props.money}
          previewState={previewState}
          label="Model fitter · preview"
          lookTitle="Recommended look"
          lookLabel="Complete look"
          tryOnSrc={tryOnImage}
          stage={tryOnStage}
        />
        <Button
          className="button primary full"
          disabled={!bundle.length && !selected.length}
          onClick={openFitting}
        >
          <Icon name="layers" />
          {bundle.length || selected.length
            ? `Virtual try-on · ${bundle.length || selected.length} ${(bundle.length || selected.length) === 1 ? "piece" : "pieces"}`
            : "Virtual try-on"}
        </Button>
        <p className="studio-disclaimer" role="status">
          {!bundle.length
            ? "Add one or more pieces and the try-on fits the recommended look on this model."
            : tryOnImage
              ? "AI try-on generated with Magic Hour from your model photo."
              : activeModelSrc
                ? "Showing your uploaded photo. It reaches Magic Hour only when you generate a try-on."
                : previewState === "loading"
                  ? tryOnStage || "Magic Hour is rendering the try-on…"
                  : tryOnConfigured
                    ? "Open the fitting studio to generate an AI try-on of this look."
                    : "Add VITE_MAGIC_API to .env to generate an AI try-on."}
        </p>
      </div>

      <div className="builder-side">
        <section className="builder-block builder-step" aria-labelledby="builder-step-models">
          <div className="builder-step-head">
            <span className="builder-step-number" aria-hidden="true">1</span>
            <Heading level={2} id="builder-step-models">Models to Try on</Heading>
            <p className="builder-step-note">Pick the model to fit pieces on, or upload your own photo.</p>
          </div>
          <div className="model-thumbs" aria-label="Choose a model">
            <button
              className={`model-thumb ${activePhoto === null ? "selected" : ""}`}
              onClick={() => setActivePhoto(null)}
              aria-pressed={activePhoto === null}
            >
              <img loading="lazy" decoding="async" src={image} alt="Default studio model" />
              <span>Studio</span>
            </button>
            {photos.map((src, i) => (
              <div key={src} className={`model-thumb ${activePhoto === i ? "selected" : ""}`}>
                <button onClick={() => setActivePhoto(i)} aria-pressed={activePhoto === i} aria-label={`Fit on uploaded model ${i + 1}`}>
                  <img loading="lazy" decoding="async" src={src} alt={`Uploaded model ${i + 1}`} />
                </button>
                <span>Model {i + 1}</span>
                <Button className="icon-button model-remove" aria-label={`Remove model ${i + 1}`} onClick={() => removePhoto(i)}>
                  <Icon name="close" />
                </Button>
              </div>
            ))}
            <button className="model-thumb model-upload" onClick={() => upload.current?.click()}>
              <Icon name="upload" />
              <span>Upload photo</span>
            </button>
          </div>
        </section>

        <section className="builder-block builder-step" aria-labelledby="builder-step-catalogue">
          <div className="builder-step-head">
            <span className="builder-step-number" aria-hidden="true">2</span>
            <Heading level={2} id="builder-step-catalogue">Clothes to Choose from</Heading>
            <p className="builder-step-note">Choose the pieces you love. The builder recommends the rest.</p>
          </div>
          {products.length > 0 && (
            <div className="shop-categories" role="group" aria-label="Filter by category">
              {(["All", ...availableCategories] as const).map((c) => {
                const count =
                  c === "All"
                    ? products.length
                    : products.filter((p) => p.category === c).length
                return (
                  <Button
                    key={c}
                    className={category === c ? "selected" : ""}
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                  >
                    {c} ({count})
                  </Button>
                )
              })}
            </div>
          )}
          <section className="shop-grid" aria-label="Product collection">
            {filtered
              .slice((collectionPage - 1) * 4, collectionPage * 4)
              .map((p) => (
                <article className={`shop-product ${isSelected(p) ? "chosen" : ""}`} key={p.sku}>
                  <Button className="shop-product-art" aria-label={`View ${p.name}`} onClick={() => openProduct(p)}>
                    <ProductImage product={p} Garment={Garment} />
                    <span className="product-art-label">
                      {!p.stock ? "Unavailable" : isSelected(p) ? "Selected" : ""}
                    </span>
                  </Button>
                  <div className="shop-product-info">
                    <div>
                      <span>{p.category}</span>
                      <Heading level={3}>
                        <Button className="product-name-link" onClick={() => openProduct(p)}>{p.name}</Button>
                      </Heading>
                      <small>
                        {productColor(p)}
                        {!p.stock && " · Out of stock"}
                      </small>
                    </div>
                    <strong>₱{p.price.toLocaleString("en-PH")}</strong>
                  </div>
                  <div className="product-actions">
                    <Button
                      className={`button ${isSelected(p) ? "secondary" : "primary"} product-outfit-action`}
                      disabled={!p.stock}
                      aria-pressed={isSelected(p)}
                      onClick={() => togglePiece(p)}
                    >
                      <Icon name={isSelected(p) ? "close" : "plus"} />
                      {isSelected(p) ? "Remove from outfit" : "Add to outfit"}
                    </Button>
                    <Button
                      className="button secondary product-cart-action"
                      disabled={!p.stock}
                      onClick={() => addCartItem(p)}
                    >
                      <Icon name="bag" />
                      Add to cart
                    </Button>
                  </div>
                </article>
              ))}
            {!filtered.length && (
              <div className="empty">
                {products.length
                  ? "No pieces match this category."
                  : "No pieces are available yet. Products appear here once a merchant adds them to the catalogue."}
              </div>
            )}
          </section>
          {collectionPages > 1 && (
            <div className="collection-pagination">
              <span aria-live="polite">
                {filtered.length} pieces · Page {collectionPage} of{" "}
                {collectionPages}
              </span>
              <div>
                    <Button
                      className="button secondary"
                      disabled={collectionPage === 1}
                      onClick={() => setCollectionPage((current) => Math.max(current - 1, 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      className="button secondary"
                      disabled={collectionPage >= collectionPages}
                      onClick={() => setCollectionPage((current) => Math.min(current + 1, collectionPages))}
                    >
                      Next
                    </Button>
              </div>
            </div>
          )}
        </section>

        <section className="builder-block builder-step" aria-labelledby="builder-step-recommendation">
          <div className="builder-step-head">
            <span className="builder-step-number" aria-hidden="true">3</span>
            <Heading level={2} id="builder-step-recommendation">Recommendation</Heading>
            <p className="builder-step-note">Your coordinated look, refreshed automatically.</p>
          </div>
          {bundle.length > 1 && <PairingGraph items={bundle} />}
          <section className="outfit-tray" aria-label="Recommended look">
            <Heading level={2}>
              Your recommended look
              {bundle.length > 0 && (
                <span className="look-count">
                  {bundle.length} {bundle.length === 1 ? "piece" : "pieces"}
                </span>
              )}
            </Heading>
            {bundle.length ? (
              <OutfitRows bundle={bundle} isSelected={isSelected} swap={swap} />
            ) : (
              <p className="shop-demo-note">Select one or more pieces above and the builder recommends a coordinated look.</p>
            )}
          </section>
          <div className="builder-ai">
            <Button
              className="button primary builder-ai-button"
              disabled={photoReco.status === "loading"}
              onClick={() => runAiRecommendation()}
            >
              <Icon name="sparkle" />
              {photoReco.status === "loading"
                ? "Styling your look…"
                : "Get AI recommendation"}
            </Button>
            <p className="shop-demo-note">
              {hasModelPhoto && photoConfigured
                ? "Your uploaded model photo is sent to the AI stylist to build this look."
                : selected.length
                  ? "Your selected pieces are sent to the AI stylist to complete the look."
                  : "The AI stylist builds a complete, in-stock look from the catalogue."}
            </p>
            {photoReco.note && (
              <p className="shop-demo-note" role="status">
                {photoReco.note}
              </p>
            )}
            {photoReco.error && (
              <div className="shop-error" role="alert">
                {photoReco.error}
              </div>
            )}
            {photoReco.warnings.length > 0 && (
              <ul className="builder-ai-warnings">
                {photoReco.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
          </div>
          {error && (
            <div className="shop-error" role="alert">
              {error}
            </div>
          )}
          <div className="builder-buttons">
            <Button className="button primary" disabled={!bundle.length} onClick={addCart}>
              <Icon name="bag" />
              Add to Cart
            </Button>
            <Button
              className="button secondary"
              disabled={!selected.length}
              onClick={() => {
                setSelected([])
                setBundle([])
                setError("")
              }}
            >
              Clear selection
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
