import { useEffect, useState } from 'react'
import StatsCard from '../components/StatsCard'
import AdminTable from '../components/AdminTable'
import Timer from '../components/Timer'
import { getDrawStatusLabel } from '../utils/draws'

const buildDrawForm = (draw) => ({
  title: draw.title,
  description: draw.description || '',
  entryFee: String(draw.entryFee || ''),
  prizeValue: String(draw.prizeValue || ''),
  maxEntries: String(draw.maxEntries || ''),
  drawDay: draw.drawDay || 'Monday',
  goLiveMode: draw.goLiveMode || 'instant',
  scheduledAt: draw.startTime ? new Date(draw.startTime).toISOString().slice(0, 16) : '',
  endTime: draw.endTime ? new Date(draw.endTime).toISOString().slice(0, 16) : '',
  imageUrl: draw.images?.[0] || draw.imageUrl || '',
  galleryImageUrls: (draw.images || []).slice(1).join('\n'),
  imageFile: [],
  status: draw.status || 'available',
})

function AdminDashboard({
  stats,
  participants,
  draws,
  referrals,
  serverNow,
  onUpdateDraw,
  onStatusChange,
  onCloseDraw,
  onDeleteDraw,
  isLoading,
}) {
  const [selectedDraw, setSelectedDraw] = useState(null)
  const [drawForm, setDrawForm] = useState(null)
  const [isSavingDraw, setIsSavingDraw] = useState(false)
  const [busyDrawAction, setBusyDrawAction] = useState(null)

  useEffect(() => {
    setDrawForm(selectedDraw ? buildDrawForm(selectedDraw) : null)
  }, [selectedDraw])

  const handleSaveDraw = async () => {
    if (!selectedDraw || !drawForm || isSavingDraw) return

    setIsSavingDraw(true)
    try {
      await onUpdateDraw(selectedDraw.id, drawForm)
      setSelectedDraw(null)
    } finally {
      setIsSavingDraw(false)
    }
  }

  const runDrawAction = async (drawId, action, handler) => {
    if (busyDrawAction) return

    setBusyDrawAction({ drawId, action })
    try {
      await handler(drawId)
      if (selectedDraw?.id === drawId && action === 'delete') {
        setSelectedDraw(null)
      }
    } finally {
      setBusyDrawAction(null)
    }
  }

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Admin Dashboard</h1>
        <p className="muted">Monitor draws, deposits, quizzes, users, and wallet movement from one place.</p>
      </header>
      <div className="grid four">
        <StatsCard label="Active Draws" value={isLoading ? '...' : stats.draws} />
        <StatsCard label="Pending Deposits" value={isLoading ? '...' : stats.pendingDeposits} />
        <StatsCard label="Today's Quiz" value={isLoading ? '...' : stats.todaysQuiz} />
        <StatsCard label="Total Users" value={isLoading ? '...' : stats.totalUsers} />
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
                <th>Slot</th>
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
                  <td>Slot {draw.slotNumber}</td>
                  <td>{draw.drawRef}</td>
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
                      <button
                        type="button"
                        className={`btn btn-primary ${busyDrawAction?.drawId === draw.id && busyDrawAction?.action === 'close' ? 'is-loading' : ''}`}
                        onClick={() => runDrawAction(draw.id, 'close', onCloseDraw)}
                        disabled={Boolean(busyDrawAction)}
                        aria-busy={busyDrawAction?.drawId === draw.id && busyDrawAction?.action === 'close'}
                      >
                        {busyDrawAction?.drawId === draw.id && busyDrawAction?.action === 'close' ? (
                          <>
                            <span className="btn-spinner" aria-hidden="true" />
                            Closing...
                          </>
                        ) : (
                          'Close Draw'
                        )}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-soft ${busyDrawAction?.drawId === draw.id && busyDrawAction?.action === 'delete' ? 'is-loading' : ''}`}
                        onClick={() => runDrawAction(draw.id, 'delete', onDeleteDraw)}
                        disabled={Boolean(busyDrawAction)}
                        aria-busy={busyDrawAction?.drawId === draw.id && busyDrawAction?.action === 'delete'}
                      >
                        {busyDrawAction?.drawId === draw.id && busyDrawAction?.action === 'delete' ? (
                          <>
                            <span className="btn-spinner" aria-hidden="true" />
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedDraw && drawForm ? (
          <section className="card stack">
            <div className="row spread">
              <h3>Edit Draw: {selectedDraw.title}</h3>
              <button type="button" className="btn btn-soft" onClick={() => setSelectedDraw(null)}>
                Close
              </button>
            </div>
            <div className="grid two">
              <label>
                Prize Title
                <input
                  type="text"
                  value={drawForm.title}
                  onChange={(event) => setDrawForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </label>
              <label>
                Draw Day
                <select
                  value={drawForm.drawDay}
                  onChange={(event) => setDrawForm((prev) => ({ ...prev, drawDay: event.target.value }))}
                >
                  <option>Monday</option>
                  <option>Wednesday</option>
                  <option>Friday</option>
                </select>
              </label>
              <label>
                Description
                <textarea
                  rows="4"
                  value={drawForm.description}
                  onChange={(event) => setDrawForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>
              <label>
                Primary Image URL
                <input
                  type="url"
                  value={drawForm.imageUrl}
                  onChange={(event) => setDrawForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                />
              </label>
              <label>
                Extra Image URLs
                <textarea
                  rows="3"
                  value={drawForm.galleryImageUrls}
                  onChange={(event) => setDrawForm((prev) => ({ ...prev, galleryImageUrls: event.target.value }))}
                />
              </label>
              <label>
                Upload Up To 3 Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => setDrawForm((prev) => ({ ...prev, imageFile: Array.from(event.target.files || []).slice(0, 3) }))}
                />
              </label>
              <label>
                Entry Fee
                <input
                  type="number"
                  value={drawForm.entryFee}
                  onChange={(event) => setDrawForm((prev) => ({ ...prev, entryFee: event.target.value }))}
                />
              </label>
              <label>
                Prize Value
                <input
                  type="number"
                  value={drawForm.prizeValue}
                  onChange={(event) => setDrawForm((prev) => ({ ...prev, prizeValue: event.target.value }))}
                />
              </label>
              <label>
                Maximum Entries
                <input
                  type="number"
                  value={drawForm.maxEntries}
                  onChange={(event) => setDrawForm((prev) => ({ ...prev, maxEntries: event.target.value }))}
                />
              </label>
              <label>
                Go Live Mode
                <select
                  value={drawForm.goLiveMode}
                  onChange={(event) => setDrawForm((prev) => ({ ...prev, goLiveMode: event.target.value }))}
                >
                  <option value="instant">Go Live Instantly</option>
                  <option value="schedule">Schedule Go Live</option>
                </select>
              </label>
              {drawForm.goLiveMode === 'schedule' ? (
                <label>
                  Start Time
                  <input
                    type="datetime-local"
                    value={drawForm.scheduledAt}
                    onChange={(event) => setDrawForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                  />
                </label>
              ) : null}
              <label>
                End Time
                <input
                  type="datetime-local"
                  value={drawForm.endTime}
                  onChange={(event) => setDrawForm((prev) => ({ ...prev, endTime: event.target.value }))}
                />
              </label>
            </div>
            <div className="row">
              <button type="button" className="btn btn-primary" onClick={handleSaveDraw} disabled={isSavingDraw}>
                {isSavingDraw ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    Saving changes...
                  </>
                ) : (
                  'Save Draw Changes'
                )}
              </button>
              <button
                type="button"
                className={`btn btn-soft ${busyDrawAction?.drawId === selectedDraw.id && busyDrawAction?.action === 'close' ? 'is-loading' : ''}`}
                onClick={() => runDrawAction(selectedDraw.id, 'close', onCloseDraw)}
                disabled={Boolean(busyDrawAction)}
                aria-busy={busyDrawAction?.drawId === selectedDraw.id && busyDrawAction?.action === 'close'}
              >
                {busyDrawAction?.drawId === selectedDraw.id && busyDrawAction?.action === 'close' ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    Closing...
                  </>
                ) : (
                  'Close Draw'
                )}
              </button>
              <button
                type="button"
                className={`btn btn-soft ${busyDrawAction?.drawId === selectedDraw.id && busyDrawAction?.action === 'delete' ? 'is-loading' : ''}`}
                onClick={() => runDrawAction(selectedDraw.id, 'delete', onDeleteDraw)}
                disabled={Boolean(busyDrawAction)}
                aria-busy={busyDrawAction?.drawId === selectedDraw.id && busyDrawAction?.action === 'delete'}
              >
                {busyDrawAction?.drawId === selectedDraw.id && busyDrawAction?.action === 'delete' ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    Deleting...
                  </>
                ) : (
                  'Delete Draw'
                )}
              </button>
            </div>
          </section>
        ) : null}
      </section>
      <section className="stack">
        <h2>Referral Insights</h2>
        <div className="grid three">
          <StatsCard label="Total Referred Users" value={referrals.totalReferredUsers || 0} />
          <StatsCard
            label="Rewarded Referrals"
            value={(referrals.latestRelationships || []).filter((item) => item.status === 'rewarded').length}
          />
          <StatsCard
            label="Top Referrer"
            value={referrals.latestRelationships?.[0]?.referrerReferenceId || 'None'}
          />
        </div>
        <AdminTable
          columns={[
            { key: 'referrerReferenceId', label: 'Referrer' },
            { key: 'refereeReferenceId', label: 'Referred User' },
            { key: 'status', label: 'Status' },
            { key: 'totalReferralsByReferrer', label: 'Total by Referrer' },
          ]}
          rows={referrals.latestRelationships || []}
        />
      </section>
    </section>
  )
}

export default AdminDashboard
