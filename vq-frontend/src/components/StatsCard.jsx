function StatsCard({ label, value, hint }) {
  return (
    <article className="card stats-card">
      <p className="eyebrow">{label}</p>
      <h3>{value}</h3>
      {hint ? <p className="muted">{hint}</p> : null}
    </article>
  )
}

export default StatsCard

