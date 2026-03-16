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
            <p className="muted">You can install VissQuest now for faster access and app-like navigation.</p>
          ) : null}
          <div className="stack">
            <strong>Android</strong>
            <p className="muted">Open the browser menu, tap Add to Home screen or Install app, then confirm.</p>
          </div>
          <div className="stack">
            <strong>iPhone Safari</strong>
            <p className="muted">Tap the Share icon, choose Add to Home Screen, then tap Add.</p>
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
