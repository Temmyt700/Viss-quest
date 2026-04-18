import { useCallback, useRef } from 'react'
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
  const lastPointerActivationRef = useRef(0)
  const showLogoutAction = isAuthenticated

  const isSyntheticClickAfterPointer = useCallback((event) => {
    if (event?.type !== 'click') return false
    return Date.now() - lastPointerActivationRef.current < 450
  }, [])

  const markPointerActivation = useCallback((event) => {
    if (event?.type !== 'pointerup') return
    if (event.pointerType === 'mouse') return
    lastPointerActivationRef.current = Date.now()
  }, [])

  const handleNavigate = useCallback((nextPath, event) => {
    if (isSyntheticClickAfterPointer(event)) return
    markPointerActivation(event)
    onNavigate(nextPath)
  }, [isSyntheticClickAfterPointer, markPointerActivation, onNavigate])

  const handleLogout = useCallback((event) => {
    if (isSyntheticClickAfterPointer(event)) return
    markPointerActivation(event)
    onLogout()
  }, [isSyntheticClickAfterPointer, markPointerActivation, onLogout])

  return (
    <header className="navbar">
      <button
        className="brand-link"
        type="button"
        onClick={(event) => handleNavigate('/', event)}
        onPointerUp={(event) => handleNavigate('/', event)}
      >
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
              onClick={(event) => handleNavigate(link.path, event)}
              onPointerUp={(event) => handleNavigate(link.path, event)}
            >
              {link.label}
            </button>
          ))}
          {showLogoutAction ? (
            <>
              <button
                type="button"
                className={`nav-link nav-link-auth-mobile active ${isLoggingOut ? 'is-loading' : ''}`}
                onClick={handleLogout}
                onPointerUp={handleLogout}
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
                onClick={handleLogout}
                onPointerUp={handleLogout}
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
          ) : (
            <>
              <button
                type="button"
                className={`nav-link nav-link-auth-mobile ${currentPath === '/login' || currentPath === '/signup' ? 'active' : ''}`}
                onClick={(event) => handleNavigate('/login', event)}
                onPointerUp={(event) => handleNavigate('/login', event)}
                disabled={isAuthLoading}
              >
                <span className="nav-link-label">{isAuthLoading ? 'Checking session...' : 'Login / Sign Up'}</span>
              </button>
              {desktopAuthLinks.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  className={`nav-link nav-link-auth-desktop ${currentPath === link.path ? 'active' : ''}`}
                  onClick={(event) => handleNavigate(link.path, event)}
                  onPointerUp={(event) => handleNavigate(link.path, event)}
                  disabled={isAuthLoading}
                >
                  {isAuthLoading && link.path === '/login' ? 'Checking session...' : link.label}
                </button>
              ))}
            </>
          )}
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
