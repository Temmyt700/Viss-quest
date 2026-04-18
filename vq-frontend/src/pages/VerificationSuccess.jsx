import { useEffect } from 'react'
import './AuthAssist.css'

function VerificationSuccess({ isAuthenticated, onNavigate }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onNavigate(isAuthenticated ? '/dashboard' : '/login')
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [isAuthenticated, onNavigate])

  return (
    <section className="auth-wrap">
      <div className="card auth-card auth-confirmation-card">
        <p className="eyebrow">Email Verified</p>
        <h1>Your account has been successfully verified</h1>
        <p className="muted">
          Your email verification is complete. We are redirecting you to {isAuthenticated ? 'your dashboard' : 'the login page'} now.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNavigate(isAuthenticated ? '/dashboard' : '/login')}
        >
          Continue
        </button>
      </div>
    </section>
  )
}

export default VerificationSuccess
