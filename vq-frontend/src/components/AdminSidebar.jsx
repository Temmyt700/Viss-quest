import './AdminSidebar.css'

const adminLinks = [
  { path: '/admin', label: 'Dashboard' },
  { path: '/admin/create-draw', label: 'Create Draw' },
  { path: '/admin/participants', label: 'Participants' },
  { path: '/admin/deposits', label: 'Wallet Deposits' },
  { path: '/admin/winners', label: 'Winners' },
  { path: '/admin/quiz', label: 'Daily Quiz' },
]

function AdminSidebar({ currentPath, onNavigate }) {
  return (
    <aside className="admin-sidebar">
      <h3>Admin Panel</h3>
      <div className="admin-nav">
        {adminLinks.map((link) => (
          <button
            key={link.path}
            type="button"
            className={`admin-link ${currentPath === link.path ? 'active' : ''}`}
            onClick={() => onNavigate(link.path)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </aside>
  )
}

export default AdminSidebar
