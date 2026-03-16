import './UserTable.css'

function UserTable({ users, onViewUser, onBanToggle, onRoleChange }) {
  return (
    <div className="table-wrap card">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Reference ID</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Wallet Balance</th>
            <th>Status</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.fullName}</td>
              <td>{user.referenceId}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>N {user.walletBalance.toLocaleString()}</td>
              <td>{user.accountStatus}</td>
              <td>{user.role}</td>
              <td>
                <div className="user-actions">
                  <button type="button" className="btn btn-soft" onClick={() => onViewUser(user.id)}>
                    View
                  </button>
                  <button type="button" className="btn btn-soft" onClick={() => onBanToggle(user.id)}>
                    {user.accountStatus === 'Suspended' ? 'Unban' : 'Ban'}
                  </button>
                  {/* The current admin UI only supports user and admin roles. */}
                  <select value={user.role} onChange={(event) => onRoleChange(user.id, event.target.value)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable
