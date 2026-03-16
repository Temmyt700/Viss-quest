import './AdminDeposits.css'

function AdminDeposits({ deposits, onApprove, onReject }) {
  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Wallet Deposits</h1>
        <p className="muted">Review pending requests and keep recent approved or rejected deposits visible for audit.</p>
      </header>
      <div className="deposit-list">
        {deposits.length ? deposits.map((deposit) => (
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
                className="btn btn-primary"
                onClick={() => onApprove(deposit.id)}
                disabled={deposit.status !== 'Pending'}
              >
                Approve
              </button>
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => onReject(deposit.id)}
                disabled={deposit.status !== 'Pending'}
              >
                Reject
              </button>
            </div>
          </article>
        )) : (
          <article className="card">
            <p className="muted">No wallet deposits yet.</p>
          </article>
        )}
      </div>
    </section>
  )
}

export default AdminDeposits
