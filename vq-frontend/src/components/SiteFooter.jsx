import './SiteFooter.css'

function SiteFooter({ onNavigate }) {
  const quickLinks = [
    {
      title: 'About VissQuest',
      description: 'Learn how VissQuest works, why users trust us, and how real winners are rewarded.',
    },
    {
      title: 'Wallet',
      description: 'Fund your wallet here, then use it to enter draws, spin, and join daily activities.',
    },
    {
      title: 'Testimonials',
      description: 'Only winners can submit testimonials and proof of receiving their prizes.',
    },
    {
      title: 'Daily Chances',
      description: 'Use Daily Spin and Daily Quiz here to collect extra chances and rewards.',
    },
    {
      title: 'Winners',
      description: 'See the latest winners first, then browse older winners in the past winners archive.',
    },
  ]

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="muted">VissQuest provides automated prize draws, wallet-based entries, and daily chances.</p>
        <div className="site-footer-guides">
          {quickLinks.map((item) => (
            <article key={item.title} className="site-footer-guide">
              <strong>{item.title}</strong>
              <p className="muted">{item.description}</p>
            </article>
          ))}
        </div>
        <div className="site-footer-links">
          <button type="button" className="text-link" onClick={() => onNavigate('/about')}>
            About Us
          </button>
        </div>
        <div className="site-footer-legal">
          <strong>Legal</strong>
          <div className="site-footer-links">
            <button type="button" className="text-link" onClick={() => onNavigate('/terms-and-conditions')}>
            Terms & Conditions
            </button>
            <button type="button" className="text-link" onClick={() => onNavigate('/privacy-policy')}>
            Privacy Policy
            </button>
            <button type="button" className="text-link" onClick={() => onNavigate('/disclaimer')}>
              Disclaimer
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
