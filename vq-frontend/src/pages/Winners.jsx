import WinnerCard from '../components/WinnerCard'
import TestimonialCard from '../components/TestimonialCard'

function Winners({ winners, testimonials }) {
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
      <section className="stack">
        <div className="section-head">
          <h2>Winner Testimonials</h2>
        </div>
        <div className="grid three">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </section>
    </section>
  )
}

export default Winners
