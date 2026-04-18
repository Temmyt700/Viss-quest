import { useMemo, useState } from 'react'
import PasswordField from '../components/PasswordField'
import './Signup.css'

function Signup({ onGoLogin, onSignup }) {
  const defaultReferralCode = useMemo(
    () => new URLSearchParams(window.location.search).get('ref') || '',
    [],
  )

  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: defaultReferralCode,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Clear inline feedback as the user edits so the form feels responsive.
  const updateField = (field, value) => {
    setFormError('')
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <section className="auth-wrap">
      <form
        className="card auth-card"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault()
          if (isSubmitting) return
          setFormError('')
          if (!formState.fullName.trim() || !formState.email.trim() || !formState.phone.trim() || !formState.password) {
            setFormError('Full name, email, phone number, and password are required.')
            return
          }
          if (formState.password !== formState.confirmPassword) {
            setFormError('Passwords do not match.')
            return
          }

          const { confirmPassword, referralCode, ...signupPayload } = formState
          setIsSubmitting(true)
          try {
            await onSignup({
              ...signupPayload,
              ...(referralCode.trim() ? { referralCode: referralCode.trim() } : {}),
            })
          } catch (error) {
            setFormError(
              error instanceof Error ? error.message : 'We could not create your account right now.',
            )
          } finally {
            setIsSubmitting(false)
          }
        }}
      >
        <h1>Create Account</h1>
        {formError ? <p className="form-error">{formError}</p> : null}
        <div className="card signup-notice">
          <strong>Important:</strong> Use the exact real name that matches your bank account.
          If the name does not match, you may not be able to receive cash prize payouts.
        </div>
        <label>
          Full Name
          <input
            type="text"
            placeholder="Ada Obi"
            value={formState.fullName}
            required
            onChange={(event) => updateField('fullName', event.target.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            placeholder="ada@example.com"
            value={formState.email}
            required
            onChange={(event) => updateField('email', event.target.value)}
          />
        </label>
        <label>
          WhatsApp Phone Number
          <input
            type="tel"
            placeholder="+234..."
            value={formState.phone}
            required
            onChange={(event) => updateField('phone', event.target.value)}
          />
        </label>
        <p className="muted">
          Your WhatsApp number is important because winners are contacted through it.
        </p>
        <PasswordField
          label="Password"
          placeholder="Create password"
          value={formState.password}
          required
          autoComplete="new-password"
          onChange={(event) => updateField('password', event.target.value)}
        />
        <PasswordField
          label="Confirm Password"
          placeholder="Confirm password"
          value={formState.confirmPassword}
          autoComplete="new-password"
          onChange={(event) => updateField('confirmPassword', event.target.value)}
        />
        <label>
          Referral Code (Optional)
          <input
            type="text"
            placeholder="VQ024"
            value={formState.referralCode}
            onChange={(event) => updateField('referralCode', event.target.value.toUpperCase())}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Creating Account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
        <p className="muted">
          Already have an account?{' '}
          <button type="button" className="text-link" onClick={onGoLogin}>
            Login
          </button>
        </p>
      </form>
    </section>
  )
}

export default Signup
