import StatsCard from '../components/StatsCard'
import AdminTable from '../components/AdminTable'

function AdminDashboard({ stats, participants }) {
  return (
    <section className="stack-lg">
      <h1>Admin Dashboard</h1>
      <div className="grid three">
        <StatsCard label="Active Draws" value={stats.draws} />
        <StatsCard label="Pending Deposits" value={stats.pendingDeposits} />
        <StatsCard label="Today's Quiz" value={stats.todaysQuiz} />
      </div>
      <h2>Participants</h2>
      <AdminTable
        columns={[
          { key: 'referenceId', label: 'Reference ID' },
          { key: 'draw', label: 'Draw' },
          { key: 'status', label: 'Status' },
        ]}
        rows={participants}
      />
    </section>
  )
}

export default AdminDashboard

