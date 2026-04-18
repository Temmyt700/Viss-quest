import './AuthAssist.css'

function SignupSuccess({ onGoLogin }) {
  return (
    <section className="auth-wrap">
      <div className="card auth-card auth-confirmation-card">
        <p className="eyebrow">Signup Successful</p>
        <h1>Check your email to verify your account</h1>
        <p className="muted">
          Your VissQuest account has been created successfully. Please check your inbox for the verification link before signing in.
        </p>
        <div className="card auth-note-card">
          <p>
            Check your inbox carefully, and if you do not see the email there, check your <strong>spam</strong> folder too.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onGoLogin}>
          Back to Login
        </button>
      </div>
    </section>
  )
}

export default SignupSuccess
