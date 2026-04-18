import { useEffect, useMemo, useState } from 'react'
import PasswordField from '../components/PasswordField'
import './AuthAssist.css'

function ResetPassword({ onBackToLogin, onSubmit }) {
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', [])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!feedback) return

    const timer = window.setTimeout(() => {
      onBackToLogin()
    }, 2600)

    return () => window.clearTimeout(timer)
  }, [feedback, onBackToLogin])

  return (
    <section className="auth-wrap">
      <form
        className="card auth-card"
        onSubmit={async (event) => {
          event.preventDefault()
          if (isSubmitting) return
          setFeedback('')
          setFormError('')
          if (!token) {
            setFormError('This reset link is missing its token. Please request a new one.')
            return
          }
          if (password !== confirmPassword) {
            setFormError('Passwords do not match.')
            return
          }

          setIsSubmitting(true)
          try {
            await onSubmit({ token, newPassword: password })
            setFeedback('Your password has been updated. You can now sign in with the new password.')
          } catch (error) {
            setFormError(error instanceof Error ? error.message : 'We could not reset your password right now.')
          } finally {
            setIsSubmitting(false)
          }
        }}
      >
        <p className="eyebrow">Secure Reset</p>
        <h1>Reset Password</h1>
        <p className="muted">Choose a new password for your VissQuest account.</p>
        {feedback ? <p className="form-success">{feedback}</p> : null}
        {formError ? <p className="form-error">{formError}</p> : null}
        <PasswordField
          label="New Password"
          placeholder="Create new password"
          value={password}
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordField
          label="Confirm Password"
          placeholder="Confirm new password"
          value={confirmPassword}
          autoComplete="new-password"
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Saving...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
        {feedback ? <p className="muted">Redirecting you back to login...</p> : null}
        <button type="button" className="text-link auth-inline-link" onClick={onBackToLogin}>
          Back to login
        </button>
      </form>
    </section>
  )
}

export default ResetPassword
