export default function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-label="Loading Forma">
      <div className="loading-screen-mark" aria-hidden="true">
        f.
      </div>
      <div className="loading-screen-track" aria-hidden="true">
        <span />
      </div>
      <p>Loading Forma</p>
    </div>
  )
}
