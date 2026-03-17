import { useState } from 'react'
import AdminTable from '../components/AdminTable'

function AdminWinners({ winners, pendingWinners, onAnnounceWinner, onRerunWinner }) {
  const [busyWinnerId, setBusyWinnerId] = useState('')
  const [busyAction, setBusyAction] = useState('')

  const runWinnerAction = async (drawId, action, handler) => {
    if (busyWinnerId) return

    setBusyWinnerId(drawId)
    setBusyAction(action)
    try {
      await handler(drawId)
    } finally {
      setBusyWinnerId('')
      setBusyAction('')
    }
  }

  return (
    <section className="stack-lg">
      <h1>Winners Management</h1>
      <section className="card stack">
        <h2>Draw Winners Control</h2>
        {(pendingWinners || []).length ? (
          pendingWinners.map((winner) => (
            <article key={winner.id} className="card stack">
              <div className="row spread">
                <div>
                  <p className="eyebrow">Pending Winner</p>
                  <h3>{winner.referenceId}</h3>
                </div>
                <span className="status-pill">Draw Slot {winner.slotNumber || '-'}</span>
              </div>
              <p className="muted">{winner.prizeTitle}</p>
              <p className="muted">{winner.suspenseMessage || 'Winner announcement coming shortly.'}</p>
              <div className="row">
                <button
                  type="button"
                  className={`btn btn-primary ${busyWinnerId === winner.drawId && busyAction === 'announce' ? 'is-loading' : ''}`}
                  onClick={() => runWinnerAction(winner.drawId, 'announce', onAnnounceWinner)}
                  disabled={Boolean(busyWinnerId)}
                >
                  {busyWinnerId === winner.drawId && busyAction === 'announce' ? 'Announcing...' : 'Announce Now'}
                </button>
                <button
                  type="button"
                  className={`btn btn-soft ${busyWinnerId === winner.drawId && busyAction === 'rerun' ? 'is-loading' : ''}`}
                  onClick={() => runWinnerAction(winner.drawId, 'rerun', onRerunWinner)}
                  disabled={Boolean(busyWinnerId)}
                >
                  {busyWinnerId === winner.drawId && busyAction === 'rerun' ? 'Re-running...' : 'Re-run Selection'}
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="muted">No pending winners right now.</p>
        )}
      </section>
      <AdminTable
        columns={[
          { key: 'referenceId', label: 'Reference ID' },
          { key: 'prize', label: 'Prize' },
          { key: 'slotNumber', label: 'Draw Slot' },
          { key: 'date', label: 'Date Won' },
        ]}
        rows={winners}
      />
    </section>
  )
}

export default AdminWinners
