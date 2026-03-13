import DrawForm from '../components/DrawForm'

function AdminCreateDraw() {
  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Create Draws</h1>
        <p className="muted">
          Schedule up to 3 draws for a draw day, define go-live timing, and support image URL or
          upload.
        </p>
      </header>
      <div className="grid three">
        {[0, 1, 2].map((index) => (
          <DrawForm key={index} index={index} />
        ))}
      </div>
      <button type="button" className="btn btn-primary">
        Save Draw Schedule
      </button>
    </section>
  )
}

export default AdminCreateDraw
