import { formatCurrency } from '../utils/format'
import { getDrawStatusLabel, isDrawEntryOpen } from '../utils/draws'
import './EntryModal.css'

function EntryModal({ draw, walletBalance, onClose, onConfirm, onFundWallet }) {
  if (!draw) return null

  const isLowBalance = walletBalance < draw.entryFee
  const isClosed = !isDrawEntryOpen(draw.status)

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3>Enter Draw</h3>
        <p className="muted">{draw.title}</p>
        <span className={`status-pill draw-status status-${draw.status}`}>{getDrawStatusLabel(draw.status)}</span>
        <div className="modal-grid">
          <div>
            <p className="eyebrow">Entry Fee</p>
            <strong>{formatCurrency(draw.entryFee)}</strong>
          </div>
          <div>
            <p className="eyebrow">Wallet Balance</p>
            <strong>{formatCurrency(walletBalance)}</strong>
          </div>
        </div>
        {isClosed ? <p className="result-muted">This draw is no longer accepting entries.</p> : null}
        {isLowBalance ? (
          <p className="result-muted">Insufficient wallet balance. Fund wallet to continue.</p>
        ) : null}
        <div className="row">
          <button type="button" className="btn btn-soft" onClick={onClose}>
            Cancel
          </button>
          {isClosed ? null : isLowBalance ? (
            <button type="button" className="btn btn-primary" onClick={onFundWallet}>
              Fund Wallet
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onConfirm}>
              Confirm Entry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EntryModal
