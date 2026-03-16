import { useState } from 'react'
import AdminTable from '../components/AdminTable'

function AdminUserDetail({ user, history, isLoading, errorMessage, onBanToggle, onRoleChange, onAdjustWallet }) {
  const [adjustment, setAdjustment] = useState({ amount: '', reason: '' })

  if (isLoading) {
    return (
      <section className="card">
        <p className="muted">Loading user details...</p>
      </section>
    )
  }

  if (errorMessage) {
    return (
      <section className="card">
        <p className="muted">{errorMessage}</p>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="card">
        <p className="muted">User not found.</p>
      </section>
    )
  }

  return (
    <section className="stack-lg">
      <header className="card">
        <p className="eyebrow">User Profile</p>
        <h1>{user.fullName}</h1>
        <p className="muted">
          {user.referenceId} | {user.email} | {user.phone}
        </p>
      </header>
      <div className="grid three">
        <section className="card">
          <p className="eyebrow">Wallet Balance</p>
          <h3>N {user.walletBalance.toLocaleString()}</h3>
        </section>
        <section className="card">
          <p className="eyebrow">Account Status</p>
          <h3>{user.accountStatus}</h3>
        </section>
        <section className="card">
          <p className="eyebrow">Role</p>
          <h3>{user.role}</h3>
        </section>
      </div>
      <div className="row">
        <button type="button" className="btn btn-soft" onClick={() => onBanToggle(user.id)}>
          {user.accountStatus === 'Suspended' ? 'Unban User' : 'Ban User'}
        </button>
        {/* Keep role changes aligned with the simplified admin-only access model. */}
        <select value={user.role} onChange={(event) => onRoleChange(user.id, event.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <section className="card stack">
        <h3>Adjust Wallet</h3>
        <div className="grid two">
          <label>
            Amount
            <input
              type="number"
              placeholder="500 or -500"
              value={adjustment.amount}
              onChange={(event) => setAdjustment((prev) => ({ ...prev, amount: event.target.value }))}
            />
          </label>
          <label>
            Reason
            <input
              type="text"
              placeholder="Bonus, correction, refund"
              value={adjustment.reason}
              onChange={(event) => setAdjustment((prev) => ({ ...prev, reason: event.target.value }))}
            />
          </label>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            await onAdjustWallet(user.id, Number(adjustment.amount), adjustment.reason)
            setAdjustment({ amount: '', reason: '' })
          }}
          disabled={!adjustment.amount || !adjustment.reason}
        >
          Save Wallet Adjustment
        </button>
      </section>
      <AdminTable
        columns={[
          { key: 'date', label: 'Wallet History Date' },
          { key: 'type', label: 'Type' },
          { key: 'amount', label: 'Amount' },
          { key: 'status', label: 'Status' },
        ]}
        rows={(history?.transactions || []).map((item) => ({
          ...item,
          amount: `N ${Math.abs(item.amount).toLocaleString()}`,
        }))}
      />
      <AdminTable
        columns={[
          { key: 'draw', label: 'Participation History' },
          { key: 'date', label: 'Date' },
          { key: 'status', label: 'Status' },
        ]}
        rows={history?.participations || []}
      />
      <AdminTable
        columns={[
          { key: 'prize', label: 'Wins' },
          { key: 'date', label: 'Date' },
        ]}
        rows={history?.wins || []}
      />
    </section>
  )
}

export default AdminUserDetail
