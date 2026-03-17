import WalletCard from '../components/WalletCard'
import WalletFundingModal from '../components/WalletFundingModal'
import { formatCurrency } from '../utils/format'
import './Wallet.css'

function Wallet({
  user,
  transactions,
  isFundingOpen,
  onFundWallet,
  onCloseFunding,
  onSubmitFunding,
  banks,
  isBanksLoading,
  banksError,
  supportContact,
  onRetryBanks,
}) {
  return (
    <section className="stack-lg">
      <WalletCard balance={user.walletBalance} onFundWallet={onFundWallet} />

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

      <WalletFundingModal
        isOpen={isFundingOpen}
        user={user}
        banks={banks}
        isBanksLoading={isBanksLoading}
        banksError={banksError}
        supportContact={supportContact}
        onClose={onCloseFunding}
        onSubmit={onSubmitFunding}
        onRetryBanks={onRetryBanks}
      />
    </section>
  )
}

export default Wallet
