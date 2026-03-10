import StatsCard from '../components/StatsCard'
import { formatCurrency } from '../utils/format'
import './Dashboard.css'

function Dashboard({ user, recentEntries, onNavigate }) {
  return (
    <section className="stack-lg">
      <header className="card">
        <p className="eyebrow">Welcome back</p>
        <h1>{user.fullName}</h1>
        <p className="muted">Reference ID: {user.referenceId}</p>
      </header>

      <div className="grid four">
        <StatsCard label="Wallet Balance" value={formatCurrency(user.walletBalance)} />
        <StatsCard label="Participations" value={user.participations} />
        <StatsCard label="Wins" value={user.wins} />
        <StatsCard label="Today" value="Draw Day Ready" hint="Monday, Wednesday, Friday" />
      </div>

      <section className="card stack">
        <h2>Quick Actions</h2>
        <div className="row">
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('/wallet')}>
            Fund Wallet
          </button>
          <button type="button" className="btn btn-soft" onClick={() => onNavigate('/daily-chances')}>
            Daily Chances
          </button>
        </div>
      </section>

      <section className="card stack">
        <h2>Recent Entries</h2>
        <div className="entries-list">
          {recentEntries.map((entry) => (
            <div key={entry.id} className="entry-item">
              <strong>{entry.prizeTitle}</strong>
              <span>{formatCurrency(entry.fee)}</span>
              <small>{entry.date}</small>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

export default Dashboard
