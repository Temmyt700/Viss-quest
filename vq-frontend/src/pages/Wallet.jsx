import WalletCard from '../components/WalletCard'
import { formatCurrency } from '../utils/format'

function Wallet({ user, transactions, onFundWallet }) {
  return (
    <section className="stack-lg">
      <WalletCard balance={user.walletBalance} onFundWallet={onFundWallet} />

      <section className="card stack">
        <h2>Funding Instructions</h2>
        <div className="grid three">
          <div>
            <p className="eyebrow">Bank Name</p>
            <strong>Providus Bank</strong>
          </div>
          <div>
            <p className="eyebrow">Account Number</p>
            <strong>1234567890</strong>
          </div>
          <div>
            <p className="eyebrow">Account Name</p>
            <strong>VissQuest Technologies</strong>
          </div>
        </div>
        <p className="muted">Include your Reference ID ({user.referenceId}) in the transfer narration.</p>
      </section>

      <section className="card stack">
        <h2>Transaction History</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{txn.date}</td>
                  <td>{txn.type}</td>
                  <td>{`${txn.amount < 0 ? '-' : '+'}${formatCurrency(txn.amount)}`}</td>
                  <td>{txn.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}

export default Wallet

