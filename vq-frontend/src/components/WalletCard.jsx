import { formatCurrency } from '../utils/format'

function WalletCard({ balance, onFundWallet }) {
  return (
    <section className="card wallet-card">
      <p className="eyebrow">Wallet Balance</p>
      <h2>{formatCurrency(balance)}</h2>
      <button type="button" className="btn btn-primary" onClick={onFundWallet}>
        Fund Wallet
      </button>
    </section>
  )
}

export default WalletCard

