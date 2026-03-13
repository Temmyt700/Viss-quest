import './TestimonialCard.css'

function TestimonialCard({ testimonial }) {
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
          <img key={`${testimonial.id}-${index}`} src={image} alt={testimonial.prizeTitle} />
        ))}
      </div>
    </article>
  )
}

export default TestimonialCard
