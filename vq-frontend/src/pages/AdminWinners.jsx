import { useState } from 'react'
import AdminTable from '../components/AdminTable'

function AdminWinners({ winners, pendingWinners, onAnnounceWinner, onRerunWinner }) {
  const [busyWinnerId, setBusyWinnerId] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const groupedPendingWinners = (pendingWinners || []).reduce((groups, winner) => {
    const existing = groups.find((item) => item.drawId === winner.drawId)
    if (existing) {
      existing.winners.push(winner)
      return groups
    }

    groups.push({
      drawId: winner.drawId,
      slotNumber: winner.slotNumber,
      drawTitle: winner.drawTitle || winner.prizeTitle,
      suspenseMessage: winner.suspenseMessage,
      winners: [winner],
    })
    return groups
  }, [])

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
        {groupedPendingWinners.length ? (
          groupedPendingWinners.map((pendingGroup) => (
            <article
              key={pendingGroup.drawId}
              className="card stack"
              style={{
                background: 'linear-gradient(145deg, rgba(245, 251, 246, 0.98), rgba(255, 255, 255, 0.98))',
                border: '1px solid #dceee0',
              }}
            >
              <div className="row spread">
                <div>
                  <p className="eyebrow">Pending Winners</p>
                  <h3>{pendingGroup.drawTitle}</h3>
                  <p className="muted">Draw Slot {pendingGroup.slotNumber || '-'} awaiting announcement.</p>
                </div>
                <span className="status-pill">{pendingGroup.winners.length} selected</span>
              </div>
              <div
                className="winner-list"
                style={{
                  gap: '0.7rem',
                  padding: '0.2rem',
                  borderRadius: '16px',
                  background: 'rgba(236, 247, 238, 0.72)',
                }}
              >
                {pendingGroup.winners.map((winner) => (
                  <div
                    key={winner.id}
                    className="entry-item"
                    style={{
                      background: 'rgba(255, 255, 255, 0.88)',
                      border: '1px solid #dce9de',
                      borderRadius: '14px',
                      padding: '0.85rem 0.9rem',
                    }}
                  >
                    <strong>{winner.referenceId}</strong>
                    <span>{winner.prizeTitle}</span>
                    <small>{winner.date || 'Pending announcement'}</small>
                  </div>
                ))}
              </div>
              <p className="muted">{pendingGroup.suspenseMessage || 'Winner announcement coming shortly.'}</p>
              <div className="row">
                <button
                  type="button"
                  className={`btn btn-primary ${busyWinnerId === pendingGroup.drawId && busyAction === 'announce' ? 'is-loading' : ''}`}
                  onClick={() => runWinnerAction(pendingGroup.drawId, 'announce', onAnnounceWinner)}
                  disabled={Boolean(busyWinnerId)}
                >
                  {busyWinnerId === pendingGroup.drawId && busyAction === 'announce' ? 'Announcing...' : 'Announce Now'}
                </button>
                <button
                  type="button"
                  className={`btn btn-soft ${busyWinnerId === pendingGroup.drawId && busyAction === 'rerun' ? 'is-loading' : ''}`}
                  onClick={() => runWinnerAction(pendingGroup.drawId, 'rerun', onRerunWinner)}
                  disabled={Boolean(busyWinnerId)}
                >
                  {busyWinnerId === pendingGroup.drawId && busyAction === 'rerun' ? 'Re-running...' : 'Re-run Selection'}
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
