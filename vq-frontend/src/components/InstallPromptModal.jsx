import './InstallPromptModal.css'

function InstallPromptModal({ isOpen, onClose, onInstall, canInstall }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card info-modal">
        <p className="eyebrow">Install VissQuest</p>
        <h3>Add VissQuest to your phone</h3>
        <div className="stack">
          {canInstall ? (
            <p className="muted">Your browser can install VissQuest directly now. Tap Install Now for the fastest path, or follow the steps below if your browser does not show the native prompt.</p>
          ) : null}
          <div className="stack">
            <strong>Android</strong>
            <p className="muted">If you do not receive the automatic installation prompt on Android, click the install button.</p>
          </div>
          <div className="stack">
            <strong>iPhone Safari</strong>
            <ol className="install-steps muted">
              <li>Open the site in Safari.</li>
              <li>Tap the Share button.</li>
              <li>Scroll down.</li>
              <li>Tap Add to Home Screen.</li>
            </ol>
          </div>
        </div>
        <div className="row">
          {canInstall ? (
            <button type="button" className="btn btn-primary" onClick={onInstall}>
              Install Now
            </button>
          ) : null}
          <button type="button" className="btn btn-soft" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstallPromptModal
