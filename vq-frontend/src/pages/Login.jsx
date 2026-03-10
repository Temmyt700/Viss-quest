import './Login.css'

function Login({ onGoSignup }) {
  return (
    <section className="auth-wrap">
      <form className="card auth-card">
        <h1>Login</h1>
        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Enter password" />
        </label>
        <button type="button" className="btn btn-primary">
          Sign In
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
