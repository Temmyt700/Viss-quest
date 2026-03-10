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

function Navbar({ currentPath, onNavigate }) {
  return (
    <header className="navbar">
      <button className="brand-link" type="button" onClick={() => onNavigate('/')}>
        <span className="brand-badge">VQ</span>
        <span>
          <strong>VissQuest</strong>
        </span>
      </button>
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
        <button
          type="button"
          className={`nav-link nav-link-auth-mobile ${currentPath === '/login' || currentPath === '/signup' ? 'active' : ''}`}
          onClick={() => onNavigate('/login')}
        >
          Login / Sign Up
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
      </nav>
    </header>
  )
}

export default Navbar
