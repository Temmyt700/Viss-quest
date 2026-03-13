import { useState } from 'react'
import StatsCard from '../components/StatsCard'
import AdminTable from '../components/AdminTable'
import Timer from '../components/Timer'
import { getDrawStatusLabel } from '../utils/draws'

function AdminDashboard({ stats, participants, draws, serverNow, onStatusChange, onCloseDraw }) {
  const [selectedDraw, setSelectedDraw] = useState(null)

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Admin Dashboard</h1>
        <p className="muted">Monitor draws, deposits, quizzes, users, and wallet movement from one place.</p>
      </header>
      <div className="grid four">
        <StatsCard label="Active Draws" value={stats.draws} />
        <StatsCard label="Pending Deposits" value={stats.pendingDeposits} />
        <StatsCard label="Today's Quiz" value={stats.todaysQuiz} />
        <StatsCard label="Total Users" value={stats.totalUsers} />
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
      <section className="stack">
        <h2>Draw Management</h2>
        <div className="table-wrap card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Draw ID</th>
                <th>Prize Name</th>
                <th>Entry Fee</th>
                <th>Total Entries</th>
                <th>Maximum Entries</th>
                <th>Current Status</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Countdown</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {draws.map((draw) => (
                <tr key={draw.id}>
                  <td>{draw.drawId}</td>
                  <td>{draw.title}</td>
                  <td>N {draw.entryFee.toLocaleString()}</td>
                  <td>{draw.currentEntries}</td>
                  <td>{draw.maxEntries}</td>
                  <td>
                    <span className={`status-pill draw-status status-${draw.status}`}>
                      {getDrawStatusLabel(draw.status)}
                    </span>
                  </td>
                  <td>{draw.startTime}</td>
                  <td>{draw.endTime}</td>
                  <td>
                    <Timer endTime={draw.endTime} serverNow={serverNow} status={draw.status} />
                  </td>
                  <td>
                    <div className="user-actions">
                      <button type="button" className="btn btn-soft" onClick={() => setSelectedDraw(draw)}>
                        View
                      </button>
                      <select
                        value={draw.manualStatus || 'auto'}
                        onChange={(event) => onStatusChange(draw.id, event.target.value)}
                      >
                        <option value="auto">Auto</option>
                        <option value="available">Available</option>
                        <option value="almost_filled">Almost Filled</option>
                        <option value="closing_soon">Closing Soon</option>
                        <option value="limited_slots">Limited Slots</option>
                        <option value="filled">Filled</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button type="button" className="btn btn-primary" onClick={() => onCloseDraw(draw.id)}>
                        Close Draw
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedDraw ? (
          <section className="card stack">
            <div className="row spread">
              <h3>{selectedDraw.title}</h3>
              <button type="button" className="btn btn-soft" onClick={() => setSelectedDraw(null)}>
                Close
              </button>
            </div>
            <p className="muted">{selectedDraw.description}</p>
            <div className="grid two">
              <div>
                <p className="eyebrow">Maximum Entries</p>
                <strong>{selectedDraw.maxEntries}</strong>
              </div>
              <div>
                <p className="eyebrow">Current Entries</p>
                <strong>{selectedDraw.currentEntries}</strong>
              </div>
              <div>
                <p className="eyebrow">Go Live Mode</p>
                <strong>{selectedDraw.goLiveMode}</strong>
              </div>
              <div>
                <p className="eyebrow">Status</p>
                <strong>{getDrawStatusLabel(selectedDraw.status)}</strong>
              </div>
            </div>
          </section>
        ) : null}
      </section>
    </section>
  )
}

export default AdminDashboard
