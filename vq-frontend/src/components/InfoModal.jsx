import './InfoModal.css'

function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card info-modal">
        <p className="eyebrow">Welcome to VissQuest</p>
        <h3>Take chances. Get lucky. Win big.</h3>
        <div className="stack">
          <p className="muted">Winners are selected randomly by the system.</p>
          <p className="muted">Participation does not guarantee winning.</p>
          <p className="muted">Only enter draws with amounts you can afford.</p>
          <p className="muted">The prize system, wallet flow, and winner selection are fully automated.</p>
        </div>
        <p className="result-success">MAY THE ALGORITHM FAVOURS YOU</p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          I Understand
        </button>
      </div>
    </div>
  )
}

export default InfoModal
