import DrawForm from '../components/DrawForm'

function AdminCreateDraw({ draws, onCreateDraw }) {
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
          <DrawForm
            key={index}
            index={index}
            existingDraw={draws.find((draw) => draw.slotNumber === index + 1)}
            onConfirmSlot={onCreateDraw}
          />
        ))}
      </div>
    </section>
  )
}

export default AdminCreateDraw
