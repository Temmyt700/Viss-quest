import { useState } from 'react'
import TestimonialCard from '../components/TestimonialCard'
import './Testimonials.css'

function Testimonials({ testimonials, canSubmit, onSubmitTestimonial }) {
  const [formState, setFormState] = useState({
    winningDate: '',
    message: '',
  })

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Winner Testimonials</h1>
        <p className="muted">Only verified winners can submit proof and share their delivery experience.</p>
      </header>

      {canSubmit ? (
        <form
          className="card testimonial-form"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmitTestimonial(formState)
            setFormState({ winningDate: '', message: '' })
          }}
        >
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
              <input type="file" multiple />
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
          <button type="submit" className="btn btn-primary">
            Submit Testimonial
          </button>
        </form>
      ) : (
        <section className="card">
          <p className="muted">Only users who have won a draw can submit testimonials.</p>
        </section>
      )}

      <div className="grid three">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </section>
  )
}

export default Testimonials
