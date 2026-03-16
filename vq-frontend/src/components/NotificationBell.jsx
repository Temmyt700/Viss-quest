import './NotificationBell.css'

function NotificationBell({ notifications, unreadCount, isOpen, isLoading, onToggle, onNavigate }) {
  return (
    <div className="notification-wrap">
      <button type="button" className="notification-trigger" onClick={onToggle} aria-label="Notifications">
        <span className="notification-icon" aria-hidden="true">
          <span className="notification-bell-top" />
          <span className="notification-bell-body" />
          <span className="notification-bell-dot" />
        </span>
        {unreadCount > 0 ? <span className="notification-count">{unreadCount}</span> : null}
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
            {isLoading ? (
              <article className="notification-item">
                <strong>Loading notifications...</strong>
                <p>Please wait a moment.</p>
              </article>
            ) : notifications.length ? (
              notifications.slice(0, 3).map((item) => (
                <article key={item.id} className="notification-item">
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <small>{item.timestamp}</small>
                </article>
              ))
            ) : (
              <article className="notification-item">
                <strong>No new notifications</strong>
                <p>You are all caught up for now.</p>
              </article>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default NotificationBell
