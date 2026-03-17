import { useState } from 'react'
import TestimonialCard from '../components/TestimonialCard'

function AdminTestimonials({ testimonials, onUpdateTestimonial, onDeleteTestimonial, onViewImages }) {
  const [editingId, setEditingId] = useState('')
  const [draft, setDraft] = useState({ prizeTitle: '', message: '', winningDate: '', imageFiles: [] })
  const [busyId, setBusyId] = useState('')
  const [loadingEditId, setLoadingEditId] = useState('')

  const openEdit = (testimonial) => {
    setLoadingEditId(testimonial.id)
    setEditingId(testimonial.id)
    setDraft({
      prizeTitle: testimonial.prizeTitle,
      message: testimonial.message,
      winningDate: testimonial.rawWinningDate ? new Date(testimonial.rawWinningDate).toISOString().slice(0, 10) : '',
      imageFiles: [],
    })
    window.setTimeout(() => setLoadingEditId(''), 250)
  }

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Testimonials</h1>
        <p className="muted">Review, edit, or remove winner testimonials when moderation is needed.</p>
      </header>
      <div className="grid three">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="card stack">
            <TestimonialCard testimonial={testimonial} onViewImages={onViewImages} />
            <div className="row">
              <button
                type="button"
                className={`btn btn-soft ${loadingEditId === testimonial.id ? 'is-loading' : ''}`}
                onClick={() => openEdit(testimonial)}
                disabled={Boolean(busyId) || loadingEditId === testimonial.id}
              >
                {loadingEditId === testimonial.id ? 'Loading...' : 'Edit'}
              </button>
              <button
                type="button"
                className={`btn btn-soft ${busyId === testimonial.id ? 'is-loading' : ''}`}
                disabled={busyId === testimonial.id}
                onClick={async () => {
                  setBusyId(testimonial.id)
                  try {
                    await onDeleteTestimonial(testimonial.id)
                  } finally {
                    setBusyId('')
                  }
                }}
              >
                {busyId === testimonial.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card admin-testimonial-modal stack">
            <div className="row spread">
              <h3>Edit Testimonial</h3>
              <button type="button" className="text-link" onClick={() => setEditingId('')}>
                Close
              </button>
            </div>
            <label>
              Prize Title
              <input
                type="text"
                value={draft.prizeTitle}
                onChange={(event) => setDraft((prev) => ({ ...prev, prizeTitle: event.target.value }))}
              />
            </label>
            <label>
              Winning Date
              <input
                type="date"
                value={draft.winningDate}
                onChange={(event) => setDraft((prev) => ({ ...prev, winningDate: event.target.value }))}
              />
            </label>
            <label>
              Message
              <textarea
                rows="4"
                value={draft.message}
                onChange={(event) => setDraft((prev) => ({ ...prev, message: event.target.value }))}
              />
            </label>
            <label>
              Replace Images (optional)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setDraft((prev) => ({ ...prev, imageFiles: Array.from(event.target.files || []).slice(0, 3) }))}
              />
            </label>
            <button
              type="button"
              className={`btn btn-primary ${busyId === editingId ? 'is-loading' : ''}`}
              onClick={async () => {
                const targetId = editingId
                setBusyId(targetId)
                try {
                  await onUpdateTestimonial(targetId, draft)
                  setEditingId('')
                } finally {
                  setBusyId('')
                }
              }}
            >
              {busyId === editingId ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default AdminTestimonials
