import { useState } from 'react'
import UserTable from '../components/UserTable'

function AdminUsers({ users, onViewUser, onBanToggle, onRoleChange }) {
  const [query, setQuery] = useState('')

  const filteredUsers = users.filter((user) => {
    const value = query.toLowerCase()
    return (
      user.fullName.toLowerCase().includes(value) ||
      user.referenceId.toLowerCase().includes(value)
    )
  })

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Users</h1>
        <p className="muted">Search by full name or Reference ID and manage account status.</p>
      </header>
      <label className="card">
        Search Users
        <input
          type="search"
          placeholder="Search name or Reference ID"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <section className="card">
        <p className="muted">
          Moderators can approve wallet deposits and suspend accounts, but cannot delete users or
          change admin settings.
        </p>
      </section>
      <UserTable
        users={filteredUsers}
        onViewUser={onViewUser}
        onBanToggle={onBanToggle}
        onRoleChange={onRoleChange}
      />
    </section>
  )
}

export default AdminUsers
