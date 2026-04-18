import { useMemo, useState } from 'react'
import './AuthAssist.css'

function ForgotPassword({ onBackToLogin, onSubmit }) {
  const redirectTo = useMemo(() => `${window.location.origin}/reset-password`, [])
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [formError, setFormError] = useState('')

  return (
    <section className="auth-wrap">
      <form
        className="card auth-card"
        onSubmit={async (event) => {
          event.preventDefault()
          if (isSubmitting) return
          setFormError('')
          setFeedback('')
          setIsSubmitting(true)
          try {
            await onSubmit({ email, redirectTo })
            setFeedback('If that email is registered, a password reset link has been sent.')
          } catch (error) {
            setFormError(error instanceof Error ? error.message : 'We could not send the reset email right now.')
          } finally {
            setIsSubmitting(false)
          }
        }}
      >
        <p className="eyebrow">Password Help</p>
        <h1>Forgot Password?</h1>
        <p className="muted">
          Enter the email linked to your account and we will send you a secure reset link through email.
        </p>
        {feedback ? <p className="form-success">{feedback}</p> : null}
        {formError ? <p className="form-error">{formError}</p> : null}
        <label>
          Email
          <input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <div className="card auth-note-card">
          <p>
            If the address is registered, we will send a reset link to that inbox. If you do not see it, check your <strong>spam</strong> folder too.
          </p>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
        <button type="button" className="text-link auth-inline-link" onClick={onBackToLogin}>
          Back to login
        </button>
      </form>
    </section>
  )
}

export default ForgotPassword
