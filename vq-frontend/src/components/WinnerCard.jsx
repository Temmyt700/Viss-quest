import './WinnerCard.css'

function WinnerCard({ winner }) {
  return (
    <article className="card winner-card">
      <img src={winner.image} alt={winner.prizeTitle} className="winner-image" />
      <div>
        <p className="eyebrow">{winner.prizeTitle}</p>
        <h3>{winner.referenceId}</h3>
        <p className="muted">{winner.date}</p>
      </div>
    </article>
  )
}

export default WinnerCard
