import AdminTable from '../components/AdminTable'

function AdminUserDetail({ user, history, onBanToggle, onRoleChange }) {
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
        <select value={user.role} onChange={(event) => onRoleChange(user.id, event.target.value)}>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
        </select>
      </div>
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
