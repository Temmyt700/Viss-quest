import './SiteFooter.css'

function SiteFooter({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="muted">VissQuest provides automated prize draws, wallet-based entries, and daily chances.</p>
        <div className="site-footer-links">
          <button type="button" className="text-link" onClick={() => onNavigate('/terms')}>
            Terms & Conditions
          </button>
          <button type="button" className="text-link" onClick={() => onNavigate('/privacy')}>
            Privacy Policy
          </button>
          <button type="button" className="text-link" onClick={() => onNavigate('/rules')}>
            Rules
          </button>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
