import { useEffect, useMemo, useState } from 'react'
import './UserTable.css'

function UserTable({ users, onViewUser, onBanToggle, onRoleChange }) {
  const pageSize = 15
  const [visibleCount, setVisibleCount] = useState(pageSize)

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [users])

  const visibleUsers = useMemo(() => users.slice(0, visibleCount), [users, visibleCount])
  const hasMore = users.length > visibleCount

  return (
    <div className="table-wrap card stack">
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
          {visibleUsers.map((user) => (
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
      {(users.length > pageSize || hasMore) ? (
        <div className="table-pagination">
          <span className="muted">
            Showing {Math.min(visibleCount, users.length)} of {users.length}
          </span>
          {hasMore ? (
            <button type="button" className="btn btn-soft" onClick={() => setVisibleCount((prev) => prev + pageSize)}>
              Load More Users
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default UserTable
