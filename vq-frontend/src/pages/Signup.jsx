import './Signup.css'

function Signup({ onGoLogin, onSignup }) {
  return (
    <section className="auth-wrap">
      <form className="card auth-card">
        <h1>Create Account</h1>
        <label>
          Full Name
          <input type="text" placeholder="Ada Obi" />
        </label>
        <label>
          Email
          <input type="email" placeholder="ada@example.com" />
        </label>
        <label>
          WhatsApp Phone Number
          <input type="tel" placeholder="+234..." />
        </label>
        <p className="muted">
          Your WhatsApp number is important because winners are contacted through it.
        </p>
        <div className="card signup-notice">
          <strong>Important:</strong> Please ensure your name matches the name on your bank
          account. If the name does not match, you may not be able to receive cash prize payouts.
        </div>
        <label>
          Password
          <input type="password" placeholder="Create password" />
        </label>
        <button type="button" className="btn btn-primary" onClick={onSignup}>
          Sign Up
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
