import StatsCard from '../components/StatsCard'
import AdminTable from '../components/AdminTable'

function AdminWalletStats({ stats, transactions }) {
  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Wallet Stats</h1>
        <p className="muted">Live platform wallet totals and complete transaction history.</p>
      </header>
      <div className="grid three">
        <StatsCard label="Total Wallet Balance" value={`N ${stats.totalWalletBalance.toLocaleString()}`} />
        <StatsCard label="Total Deposits" value={`N ${stats.totalDeposits.toLocaleString()}`} />
        <StatsCard label="Spent on Entries" value={`N ${stats.totalSpentOnEntries.toLocaleString()}`} />
        <StatsCard label="Spent on Spins" value={`N ${stats.totalSpentOnSpins.toLocaleString()}`} />
        <StatsCard label="Rewards Paid" value={`N ${stats.totalRewardsPaid.toLocaleString()}`} />
      </div>
      <AdminTable
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'type', label: 'Type' },
          { key: 'amount', label: 'Amount' },
          { key: 'status', label: 'Status' },
        ]}
        rows={transactions.map((item) => ({
          ...item,
          amount: `N ${Math.abs(item.amount).toLocaleString()}`,
        }))}
      />
    </section>
  )
}

export default AdminWalletStats
