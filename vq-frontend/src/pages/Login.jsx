import { useState } from 'react'
import './Login.css'

function Login({ onGoSignup, onLogin }) {
  const [formState, setFormState] = useState({
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Keep auth errors inside the form so failed sign-ins do not trigger browser alerts.
  const updateField = (field, value) => {
    setFormError('')
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <section className="auth-wrap">
      <form
        className="card auth-card"
        onSubmit={async (event) => {
          event.preventDefault()
          if (isSubmitting) return
          setFormError('')
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
        {formError ? <p className="form-error">{formError}</p> : null}
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
