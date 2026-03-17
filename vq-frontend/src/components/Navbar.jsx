import NotificationBell from './NotificationBell'
import './Navbar.css'

const links = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/daily-chances', label: 'Daily Chances' },
  { path: '/winners', label: 'Winners' },
]

const desktopAuthLinks = [
  { path: '/login', label: 'Login' },
  { path: '/signup', label: 'Sign Up' },
]

function Navbar({
  currentPath,
  onNavigate,
  notifications,
  notificationsUnreadCount,
  isNotificationsOpen,
  isNotificationsLoading,
  onToggleNotifications,
  isAuthenticated,
  isAuthLoading,
  isLoggingOut,
  onLogout,
}) {
  const showLogoutAction = isAuthenticated || isLoggingOut

  return (
    <header className="navbar">
      <button className="brand-link" type="button" onClick={() => onNavigate('/')}>
        <span className="brand-badge">VQ</span>
        <span>
          <strong>VissQuest</strong>
        </span>
      </button>
      <div className="nav-shell">
        <nav className="nav-links">
          {links.map((link) => (
            <button
              key={link.path}
              type="button"
              className={`nav-link ${currentPath === link.path ? 'active' : ''}`}
              onClick={() => onNavigate(link.path)}
            >
              {link.label}
            </button>
          ))}
          {!isAuthLoading
            ? showLogoutAction
              ? (
                <>
                  <button
                    type="button"
                    className={`nav-link nav-link-auth-mobile active ${isLoggingOut ? 'is-loading' : ''}`}
                    onClick={onLogout}
                    disabled={isLoggingOut}
                    aria-busy={isLoggingOut}
                  >
                    <span className="nav-link-label nav-link-loading-label">
                      {isLoggingOut ? (
                        <>
                          <span className="btn-spinner nav-link-spinner" aria-hidden="true" />
                          Logging out...
                        </>
                      ) : (
                        'Logout'
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`nav-link nav-link-auth-desktop active ${isLoggingOut ? 'is-loading' : ''}`}
                    onClick={onLogout}
                    disabled={isLoggingOut}
                    aria-busy={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <span className="btn-spinner nav-link-spinner" aria-hidden="true" />
                        Logging out...
                      </>
                    ) : (
                      'Logout'
                    )}
                  </button>
                </>
                )
              : (
                <>
                  <button
                    type="button"
                    className={`nav-link nav-link-auth-mobile ${currentPath === '/login' || currentPath === '/signup' ? 'active' : ''}`}
                    onClick={() => onNavigate('/login')}
                  >
                    <span className="nav-link-label">Login / Sign Up</span>
                  </button>
                  {desktopAuthLinks.map((link) => (
                    <button
                      key={link.path}
                      type="button"
                      className={`nav-link nav-link-auth-desktop ${currentPath === link.path ? 'active' : ''}`}
                      onClick={() => onNavigate(link.path)}
                    >
                      {link.label}
                    </button>
                  ))}
                </>
                )
            : null}
        </nav>
        <div className="nav-utility">
          <NotificationBell
            notifications={notifications}
            unreadCount={notificationsUnreadCount}
            isOpen={isNotificationsOpen}
            isLoading={isNotificationsLoading}
            onToggle={onToggleNotifications}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </header>
  )
}

export default Navbar
