import WinnerCard from '../components/WinnerCard'

function Winners({ winners }) {
  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Winners History</h1>
        <p className="muted">Transparent winner records shown with reference IDs.</p>
      </header>
      <div className="grid three">
        {winners.map((winner) => (
          <WinnerCard key={winner.id} winner={winner} />
        ))}
      </div>
    </section>
  )
}

export default Winners

