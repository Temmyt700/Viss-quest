import Timer from './Timer'
import { formatCurrency } from '../utils/format'
import { getDrawStatusLabel, isDrawEntryOpen } from '../utils/draws'
import './PrizeCard.css'

function PrizeCard({ draw, serverNow, onViewDraw, onEnterDraw }) {
  const isOpen = isDrawEntryOpen(draw.status)

  return (
    <article
      className="card prize-card"
      role="button"
      tabIndex={0}
      onClick={() => onViewDraw(draw)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onViewDraw(draw)
        }
      }}
    >
      <img
        src={draw.image}
        alt={draw.title}
        className="prize-image"
        referrerPolicy="no-referrer"
        onError={(event) => {
          event.currentTarget.style.visibility = 'hidden'
        }}
      />
      <div className="prize-content">
        <div className="row spread">
          <h3>{draw.title}</h3>
          <span className={`status-pill draw-status status-${draw.status}`}>{getDrawStatusLabel(draw.status)}</span>
        </div>
        <p className="entry-fee">Entry Fee: {formatCurrency(draw.entryFee)}</p>
        <Timer endTime={draw.endTime} serverNow={serverNow} status={draw.status} />
        <button
          type="button"
          className={`btn ${isOpen ? 'btn-primary' : 'btn-disabled'}`}
          onClick={(event) => {
            event.stopPropagation()
            onEnterDraw(draw)
          }}
          disabled={!isOpen}
        >
          {isOpen ? 'Enter Draw' : 'Entries Closed'}
        </button>
      </div>
    </article>
  )
}

export default PrizeCard
