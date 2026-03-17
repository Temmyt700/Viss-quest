import './TestimonialCard.css'

function TestimonialCard({ testimonial, onViewImages }) {
  return (
    <article className="card testimonial-card">
      <div className="row spread">
        <div>
          <p className="eyebrow">Winner Testimonial</p>
          <h3>{testimonial.referenceId}</h3>
        </div>
        <span className="status-pill">{testimonial.prizeTitle}</span>
      </div>
      <p className="muted">{testimonial.winningDate}</p>
      <p>{testimonial.message}</p>
      <div className="testimonial-images">
        {testimonial.images.map((image, index) => (
          <button
            key={`${testimonial.id}-${index}`}
            type="button"
            className="testimonial-image-btn"
            onClick={() => onViewImages?.(testimonial, index)}
          >
            <img src={image} alt={testimonial.prizeTitle} />
          </button>
        ))}
      </div>
    </article>
  )
}

export default TestimonialCard
