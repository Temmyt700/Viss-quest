import './Notifications.css'

function Notifications({ notifications }) {
  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Notifications</h1>
        <p className="muted">Admin announcements, winners, and platform updates live here.</p>
      </header>
      <div className="notification-page-list">
        {notifications.map((item) => (
          <article key={item.id} className="card notification-page-item">
            <div className="row spread">
              <h3>{item.title}</h3>
              <span className="status-pill">{item.timestamp}</span>
            </div>
            <p className="muted">{item.message}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Notifications
