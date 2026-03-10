import Timer from './Timer'
import { formatCurrency } from '../utils/format'
import './PrizeCard.css'

function PrizeCard({ draw, onEnterDraw }) {
  return (
    <article className="card prize-card">
      <img src={draw.image} alt={draw.title} className="prize-image" />
      <div className="prize-content">
        <div className="row spread">
          <h3>{draw.title}</h3>
          <span className="status-pill">{draw.status}</span>
        </div>
        <p className="entry-fee">Entry Fee: {formatCurrency(draw.entryFee)}</p>
        <Timer endTime={draw.endsAt} />
        <button type="button" className="btn btn-primary" onClick={() => onEnterDraw(draw)}>
          Enter Draw
        </button>
      </div>
    </article>
  )
}

export default PrizeCard
