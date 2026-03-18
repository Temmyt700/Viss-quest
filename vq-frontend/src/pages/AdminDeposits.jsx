import { useEffect, useState } from 'react'
import './AdminDeposits.css'

function AdminDeposits({ deposits, onApprove, onReject }) {
  const [busyDepositId, setBusyDepositId] = useState(null)
  const [busyAction, setBusyAction] = useState('')
  const [visibleCount, setVisibleCount] = useState(10)

  useEffect(() => {
    setVisibleCount(10)
  }, [deposits])

  const runDepositAction = async (depositId, action, handler) => {
    if (busyDepositId) return

    setBusyDepositId(depositId)
    setBusyAction(action)
    try {
      await handler(depositId)
    } finally {
      setBusyDepositId(null)
      setBusyAction('')
    }
  }

  const visibleDeposits = deposits.slice(0, visibleCount)
  const hasMore = deposits.length > visibleCount

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Wallet Deposits</h1>
        <p className="muted">Review pending requests and keep recent approved or rejected deposits visible for audit.</p>
      </header>
      <div className="deposit-list">
        {visibleDeposits.length ? visibleDeposits.map((deposit) => (
          <article key={deposit.id} className="card deposit-card">
            <div className="row spread">
              <div>
                <h3>{deposit.referenceId}</h3>
                <p className="muted">{deposit.timestamp}</p>
              </div>
              <span className={`status-pill deposit-status deposit-status-${deposit.status.toLowerCase()}`}>
                {deposit.status}
              </span>
            </div>
            <p>Amount: N {deposit.amount.toLocaleString()}</p>
            <div className="row">
              <button
                type="button"
                className={`btn btn-primary ${busyDepositId === deposit.id && busyAction === 'approve' ? 'is-loading' : ''}`}
                onClick={() => runDepositAction(deposit.id, 'approve', onApprove)}
                disabled={deposit.status !== 'Pending' || busyDepositId === deposit.id}
                aria-busy={busyDepositId === deposit.id && busyAction === 'approve'}
              >
                {busyDepositId === deposit.id && busyAction === 'approve' ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    Approving...
                  </>
                ) : (
                  'Approve'
                )}
              </button>
              <button
                type="button"
                className={`btn btn-soft ${busyDepositId === deposit.id && busyAction === 'reject' ? 'is-loading' : ''}`}
                onClick={() => runDepositAction(deposit.id, 'reject', onReject)}
                disabled={deposit.status !== 'Pending' || busyDepositId === deposit.id}
                aria-busy={busyDepositId === deposit.id && busyAction === 'reject'}
              >
                {busyDepositId === deposit.id && busyAction === 'reject' ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    Rejecting...
                  </>
                ) : (
                  'Reject'
                )}
              </button>
            </div>
          </article>
        )) : (
          <article className="card">
            <p className="muted">No wallet deposits yet.</p>
          </article>
        )}
      </div>
      {hasMore ? (
        <div className="row spread">
          <span className="muted">
            Showing {visibleDeposits.length} of {deposits.length} deposits
          </span>
          <button type="button" className="btn btn-soft" onClick={() => setVisibleCount((prev) => prev + 10)}>
            Load More Deposits
          </button>
        </div>
      ) : null}
    </section>
  )
}

export default AdminDeposits
