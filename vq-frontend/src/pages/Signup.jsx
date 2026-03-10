import './Signup.css'

function Signup({ onGoLogin }) {
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
        <label>
          Password
          <input type="password" placeholder="Create password" />
        </label>
        <button type="button" className="btn btn-primary">
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
