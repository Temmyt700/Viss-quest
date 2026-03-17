import { useState } from 'react'

function AdminNotifications({ settings, notifications, onSendNotification, onUpdateSettings }) {
  const [formState, setFormState] = useState({
    title: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Notifications</h1>
        <p className="muted">Send announcements to every user and control key automatic notification events.</p>
      </header>

      <section className="card stack">
        <h2>Send To All Users</h2>
        <label>
          Title
          <input
            type="text"
            placeholder="New draw is live"
            value={formState.title}
            onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
          />
        </label>
        <label>
          Message
          <textarea
            rows="4"
            placeholder="A new draw is now available on VissQuest."
            value={formState.message}
            onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
          />
        </label>
        <button
          type="button"
          className={`btn btn-primary ${isSubmitting ? 'is-loading' : ''}`}
          disabled={isSubmitting || !formState.title.trim() || !formState.message.trim()}
          aria-busy={isSubmitting}
          onClick={async () => {
            setIsSubmitting(true)
            try {
              await onSendNotification({
                title: formState.title.trim(),
                message: formState.message.trim(),
                type: 'announcement',
              })
              setFormState({ title: '', message: '' })
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          {isSubmitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Sending...
            </>
          ) : (
            'Send to all users'
          )}
        </button>
      </section>

      <section className="card stack">
        <h2>Automatic Notifications</h2>
        <label className="row spread">
          <span>Funding approved</span>
          <input
            type="checkbox"
            checked={Boolean(settings.fundingApproved)}
            onChange={(event) => onUpdateSettings({ fundingApproved: event.target.checked })}
          />
        </label>
        <label className="row spread">
          <span>Prize won</span>
          <input
            type="checkbox"
            checked={Boolean(settings.prizeWon)}
            onChange={(event) => onUpdateSettings({ prizeWon: event.target.checked })}
          />
        </label>
        <label className="row spread">
          <span>Referral reward credited</span>
          <input
            type="checkbox"
            checked={Boolean(settings.referralReward)}
            onChange={(event) => onUpdateSettings({ referralReward: event.target.checked })}
          />
        </label>
      </section>

      <section className="card stack">
        <h2>Recent Notifications</h2>
        <div className="notification-page-list">
          {notifications.slice(0, 5).map((item) => (
            <article key={item.id} className="notification-page-item">
              <div className="row spread">
                <strong>{item.title}</strong>
                <span className="status-pill">{item.timestamp}</span>
              </div>
              <p className="muted">{item.message}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export default AdminNotifications
