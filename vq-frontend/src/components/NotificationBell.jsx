import './NotificationBell.css'

function NotificationBell({ notifications, isOpen, onToggle, onNavigate }) {
  return (
    <div className="notification-wrap">
      <button type="button" className="notification-trigger" onClick={onToggle} aria-label="Notifications">
        <span className="notification-icon" aria-hidden="true">
          <span className="notification-bell-top" />
          <span className="notification-bell-body" />
          <span className="notification-bell-dot" />
        </span>
        <span className="notification-count">{notifications.length}</span>
      </button>
      {isOpen ? (
        <div className="notification-dropdown">
          <div className="notification-dropdown-head">
            <strong>Notifications</strong>
            <button type="button" className="text-link" onClick={() => onNavigate('/notifications')}>
              View all
            </button>
          </div>
          <div className="notification-list">
            {notifications.slice(0, 3).map((item) => (
              <article key={item.id} className="notification-item">
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <small>{item.timestamp}</small>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default NotificationBell
