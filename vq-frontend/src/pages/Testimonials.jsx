import { useEffect, useMemo, useState } from 'react'
import TestimonialCard from '../components/TestimonialCard'
import './Testimonials.css'

function Testimonials({
  testimonials,
  access,
  currentUserId,
  onSubmitTestimonial,
  onUpdateTestimonial,
  onViewImages,
}) {
  const [formState, setFormState] = useState({
    winningDate: '',
    message: '',
  })
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [infoModal, setInfoModal] = useState('')
  const [showPastTestimonials, setShowPastTestimonials] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState(null)
  const [editForm, setEditForm] = useState({ prizeTitle: '', message: '', winningDate: '', imageFiles: [] })
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    if (!access.canViewSubmission) {
      setInfoModal('This page is only available to winners to drop their testimonials and proof of receiving their winnings.')
    }
  }, [access.canViewSubmission])

  const latestTestimonials = testimonials.slice(0, 3)
  const pastTestimonials = testimonials.slice(3)
  const groupedPastTestimonials = useMemo(
    () =>
      pastTestimonials.reduce((groups, testimonial) => {
        const key = testimonial.winningDate || 'Recent'
        groups[key] = groups[key] || []
        groups[key].push(testimonial)
        return groups
      }, {}),
    [pastTestimonials],
  )

  const canSubmitNow = access.canSubmit && !isSubmitting

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmitNow) return

    setIsSubmitting(true)
    try {
      await onSubmitTestimonial(formState, images)
      setFormState({ winningDate: '', message: '' })
      setImages([])
      setInfoModal('Thank you for submitting proof of receiving your prize. Your testimonial helps other VissQuesters know that our platform is trustworthy and that winners receive their prizes. You will have access to this page again when you win another draw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (testimonial) => {
    setEditingTestimonial(testimonial)
    setEditForm({
      prizeTitle: testimonial.prizeTitle,
      message: testimonial.message,
      winningDate: testimonial.rawWinningDate ? new Date(testimonial.rawWinningDate).toISOString().slice(0, 10) : '',
      imageFiles: [],
    })
    setEditError('')
  }

  return (
    <section className="stack-lg">
      <header className="card testimonials-hero">
        <div className="testimonials-hero-badges" aria-hidden="true">
          <span className="testimonials-hero-badge">Proof From Winners</span>
          <span className="testimonials-hero-badge testimonials-hero-badge-soft">Real Prize Moments</span>
        </div>
        <h1>Winner Testimonials</h1>
        <p className="muted">Latest proof stays highlighted, while older testimonials move into a past testimonials archive.</p>
      </header>

      {access.canSubmit ? (
        <form className="card testimonial-form testimonial-form-card" onSubmit={handleSubmit}>
          <div className="grid two">
            <label>
              Winning Date
              <input
                type="date"
                value={formState.winningDate}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, winningDate: event.target.value }))
                }
              />
            </label>
            <label>
              Upload Images (max 3)
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => setImages(Array.from(event.target.files || []).slice(0, 3))}
              />
            </label>
          </div>
          <label>
            Message
            <textarea
              rows="4"
              placeholder="Yes I received my prize and VissQuest is legit."
              value={formState.message}
              onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
            />
          </label>
          <button type="submit" className={`btn btn-primary ${isSubmitting ? 'is-loading' : ''}`} disabled={!canSubmitNow}>
            {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
          </button>
        </form>
      ) : (
        <section className="card testimonial-access-card">
          <p className="muted">
            {access.canViewSubmission
              ? 'Your testimonial submission is unavailable until you win another draw.'
              : 'Only users who have won a draw can submit testimonials.'}
          </p>
        </section>
      )}

      <section className="stack">
        <div className="section-head">
          <div>
            <p className="testimonials-section-kicker">Latest Testimonials</p>
            <h2>Fresh Proof From Winners</h2>
          </div>
        </div>
        {latestTestimonials.length ? (
          <div className="grid three">
            {latestTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="stack">
                <TestimonialCard testimonial={testimonial} onViewImages={onViewImages} />
                {testimonial.userId === currentUserId ? (
                  <button type="button" className="btn btn-soft" onClick={() => openEdit(testimonial)}>
                    Edit Testimonial
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <article className="card testimonial-access-card">
            <p className="muted">Fresh winner proof will light up this section as soon as new testimonials come in.</p>
          </article>
        )}
      </section>

      <section className="card stack">
        <div className="row spread">
          <div>
            <p className="testimonials-section-kicker">Past Testimonials</p>
            <h2>Proof Archive</h2>
            <p className="muted">Older winner proofs are grouped here to keep the page clean as testimonials grow.</p>
          </div>
          <button type="button" className="btn btn-soft" onClick={() => setShowPastTestimonials((prev) => !prev)}>
            {showPastTestimonials ? 'Hide Past Testimonials' : 'View Past Testimonials'}
          </button>
        </div>
        {showPastTestimonials ? (
          Object.entries(groupedPastTestimonials).length ? (
            Object.entries(groupedPastTestimonials).map(([date, items]) => (
              <section key={date} className="stack">
                <p className="eyebrow">{date}</p>
                <div className="grid three">
                  {items.map((testimonial) => (
                    <div key={testimonial.id} className="stack">
                      <TestimonialCard testimonial={testimonial} onViewImages={onViewImages} />
                      {testimonial.userId === currentUserId ? (
                        <button type="button" className="btn btn-soft" onClick={() => openEdit(testimonial)}>
                          Edit Testimonial
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p className="muted">Past testimonials will appear here as more winners submit their proof.</p>
          )
        ) : null}
      </section>

      {infoModal ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Testimonials</h3>
            <p>{infoModal}</p>
            <button type="button" className="btn btn-primary" onClick={() => setInfoModal('')}>
              I understand
            </button>
          </div>
        </div>
      ) : null}

      {editingTestimonial ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card stack">
            <div className="row spread">
              <h3>Edit Testimonial</h3>
              <button type="button" className="text-link" onClick={() => setEditingTestimonial(null)}>
                Close
              </button>
            </div>
            <label>
              Prize Title
              <input
                type="text"
                value={editForm.prizeTitle}
                onChange={(event) => setEditForm((prev) => ({ ...prev, prizeTitle: event.target.value }))}
              />
            </label>
            <label>
              Winning Date
              <input
                type="date"
                value={editForm.winningDate}
                onChange={(event) => setEditForm((prev) => ({ ...prev, winningDate: event.target.value }))}
              />
            </label>
            <label>
              Message
              <textarea
                rows="4"
                value={editForm.message}
                onChange={(event) => setEditForm((prev) => ({ ...prev, message: event.target.value }))}
              />
            </label>
            <label>
              Replace Images (optional)
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => setEditForm((prev) => ({ ...prev, imageFiles: Array.from(event.target.files || []).slice(0, 3) }))}
              />
            </label>
            {editError ? <p className="form-error">{editError}</p> : null}
            <button
              type="button"
              className={`btn btn-primary ${isSavingEdit ? 'is-loading' : ''}`}
              disabled={isSavingEdit}
              onClick={async () => {
                setIsSavingEdit(true)
                setEditError('')
                try {
                  await onUpdateTestimonial(editingTestimonial.id, editForm)
                  setEditingTestimonial(null)
                  setInfoModal('Your testimonial has been updated successfully.')
                } catch (error) {
                  setEditError(error instanceof Error ? error.message : 'Unable to update your testimonial right now.')
                } finally {
                  setIsSavingEdit(false)
                }
              }}
            >
              {isSavingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default Testimonials
