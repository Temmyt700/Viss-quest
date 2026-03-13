import WalletCard from '../components/WalletCard'
import WalletFundingModal from '../components/WalletFundingModal'
import { formatCurrency } from '../utils/format'
import './Wallet.css'

function Wallet({
  user,
  transactions,
  banks,
  supportContact,
  isFundingOpen,
  onFundWallet,
  onCloseFunding,
  onSubmitFunding,
}) {
  return (
    <section className="stack-lg">
      <WalletCard balance={user.walletBalance} onFundWallet={onFundWallet} />

      <section className="card stack">
        <h2>Funding Instructions</h2>
        <div className="wallet-warning">
          <strong>IMPORTANT:</strong> You MUST include your Reference ID in the bank transfer
          narration. If your Reference ID is missing from the narration, your wallet cannot be
          credited.
        </div>
        <div className="grid two">
          {banks.map((bank) => (
            <div key={bank.id} className="card">
              <p className="eyebrow">Bank Name</p>
              <strong>{bank.bankName}</strong>
              <p className="eyebrow">Account Number</p>
              <strong>{bank.accountNumber}</strong>
              <p className="eyebrow">Account Name</p>
              <strong>{bank.accountName}</strong>
            </div>
          ))}
        </div>
        <p className="muted">Reference ID for narration: {user.referenceId}</p>
        <p className="muted">
          If your wallet balance does not update within 24 hours, please send a screenshot of your
          payment to our WhatsApp number: {supportContact.whatsapp} or our support email:{' '}
          {supportContact.email}.
        </p>
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

      <WalletFundingModal
        isOpen={isFundingOpen}
        user={user}
        banks={banks}
        supportContact={supportContact}
        onClose={onCloseFunding}
        onSubmit={onSubmitFunding}
      />
    </section>
  )
}

export default Wallet
