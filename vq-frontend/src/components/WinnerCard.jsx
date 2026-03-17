import './WinnerCard.css'

function WinnerCard({ winner, variant = 'card', onCelebrate }) {
  const content = (
    <>
      {winner.image ? <img src={winner.image} alt={winner.prizeTitle} className="winner-image" /> : null}
      <div className="winner-copy">
        <div>
          <p className="eyebrow">{winner.prizeTitle}</p>
          <h3>{winner.referenceId}</h3>
        </div>
        <div className="winner-metrics">
          <div>
            <span className="winner-meta-label">Draw Slot</span>
            <strong>{winner.slotNumber ? `Slot ${winner.slotNumber}` : 'Recent'}</strong>
          </div>
          <div>
            <span className="winner-meta-label">Date Won</span>
            <strong>{winner.date}</strong>
          </div>
          <div>
            <span className="winner-meta-label">Status</span>
            <strong>Winner Announced</strong>
          </div>
        </div>
      </div>
    </>
  )

  if (onCelebrate) {
    return (
      <button
        type="button"
        className={`card winner-card ${variant === 'list' ? 'winner-card-list' : ''} ${variant === 'homepage' ? 'winner-card-homepage' : ''} winner-card-button`}
        onClick={() => onCelebrate(winner)}
      >
        {content}
      </button>
    )
  }

  return (
    <article className={`card winner-card ${variant === 'list' ? 'winner-card-list' : ''} ${variant === 'homepage' ? 'winner-card-homepage' : ''}`}>
      {content}
    </article>
  )
}

export default WinnerCard
