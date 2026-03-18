import './Notifications.css'

function Notifications({ notifications, hasMore, onLoadMore, isLoadingMore }) {
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
      {hasMore ? (
        <div className="row spread">
          <span className="muted">Showing {notifications.length} notifications</span>
          <button
            type="button"
            className={`btn btn-soft ${isLoadingMore ? 'is-loading' : ''}`}
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Load More Notifications'}
          </button>
        </div>
      ) : null}
    </section>
  )
}

export default Notifications
