import { useState } from 'react'
import './Login.css'

function Login({ onGoSignup, onGoForgotPassword, onLogin, onResendVerification }) {
  const [formState, setFormState] = useState({
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [formSuccess, setFormSuccess] = useState('')
  const isEmailJustVerified = new URLSearchParams(window.location.search).get('verified') === '1'

  // Keep auth errors inside the form so failed sign-ins do not trigger browser alerts.
  const updateField = (field, value) => {
    setFormError('')
    setFormSuccess('')
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const shouldShowResend = /verify/i.test(formError)

  return (
    <section className="auth-wrap">
      <form
        className="card auth-card"
        onSubmit={async (event) => {
          event.preventDefault()
          if (isSubmitting) return
          setFormError('')
          setFormSuccess('')
          setIsSubmitting(true)
          try {
            await onLogin(formState)
          } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Invalid email or password.')
          } finally {
            setIsSubmitting(false)
          }
        }}
        >
        <h1>Login</h1>
        {isEmailJustVerified ? <p className="form-success">Your email has been verified. You can now sign in.</p> : null}
        {formSuccess ? <p className="form-success">{formSuccess}</p> : null}
        {formError ? <p className="form-error">{formError}</p> : null}
        {shouldShowResend ? (
          <button
            type="button"
            className="text-link auth-inline-link"
            disabled={isResendingVerification}
            onClick={async () => {
              if (!formState.email.trim()) return
              setIsResendingVerification(true)
              setFormError('')
              setFormSuccess('')
              try {
                await onResendVerification?.(formState.email)
                setFormSuccess('Verification email sent. Please check your inbox before signing in.')
              } catch (error) {
                setFormError(error instanceof Error ? error.message : 'We could not resend the verification email.')
              } finally {
                setIsResendingVerification(false)
              }
            }}
          >
            {isResendingVerification ? 'Resending verification...' : 'Resend verification email'}
          </button>
        ) : null}
        <label>
          Email
          <input
            type="email"
            placeholder="you@example.com"
            value={formState.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            placeholder="Enter password"
            value={formState.password}
            onChange={(event) => updateField('password', event.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
        <p className="muted">
          Forgot your password?{' '}
          <button type="button" className="text-link" onClick={onGoForgotPassword}>
            Reset it
          </button>
        </p>
        <p className="muted">
          No account yet?{' '}
          <button type="button" className="text-link" onClick={onGoSignup}>
            Create one
          </button>
        </p>
      </form>
    </section>
  )
}

export default Login
