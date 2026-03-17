import { useMemo, useState } from 'react'
import WinnerCard from '../components/WinnerCard'
import TestimonialCard from '../components/TestimonialCard'
import './Winners.css'

function Winners({ winners, testimonials, onViewTestimonialImages, onCelebrateWinner }) {
  const [showPastWinners, setShowPastWinners] = useState(false)
  const [showPastTestimonials, setShowPastTestimonials] = useState(false)

  const latestWinners = winners.slice(0, 3)
  const pastWinners = winners.slice(3)
  const latestTestimonials = testimonials.slice(0, 3)
  const pastTestimonials = testimonials.slice(3)
  const groupedPastWinners = useMemo(() => {
    return pastWinners.reduce((groups, winner) => {
      const key = winner.date || 'Recent'
      groups[key] = groups[key] || []
      groups[key].push(winner)
      return groups
    }, {})
  }, [pastWinners])
  const groupedPastTestimonials = useMemo(() => {
    return pastTestimonials.reduce((groups, testimonial) => {
      const key = testimonial.winningDate || 'Recent'
      groups[key] = groups[key] || []
      groups[key].push(testimonial)
      return groups
    }, {})
  }, [pastTestimonials])

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Winners History</h1>
        <p className="muted">The latest 3 winners stay highlighted here, while older winners move into the past winners archive.</p>
      </header>

      <section className="stack">
        <div className="section-head">
          <h2>Latest Winners</h2>
        </div>
        <div className="winner-list">
          {latestWinners.length ? latestWinners.map((winner) => (
            <WinnerCard key={winner.id} winner={winner} variant="homepage" onCelebrate={onCelebrateWinner} />
          )) : (
            <article className="card">
              <p className="muted">Latest winners will appear here as soon as a draw is announced.</p>
            </article>
          )}
        </div>
      </section>

      <section className="card stack">
        <div className="row spread">
          <div>
            <h2>Past Winners</h2>
            <p className="muted">Older winners are grouped by the date they were announced.</p>
          </div>
          <button type="button" className="btn btn-soft" onClick={() => setShowPastWinners((prev) => !prev)}>
            {showPastWinners ? 'Hide Past Winners' : 'View Past Winners'}
          </button>
        </div>
        {showPastWinners ? (
          Object.entries(groupedPastWinners).length ? (
            Object.entries(groupedPastWinners).map(([date, group]) => (
              <section key={date} className="stack">
                <p className="eyebrow">{date}</p>
                <div className="winner-list">
                  {group.map((winner) => (
                    <WinnerCard key={winner.id} winner={winner} variant="homepage" onCelebrate={onCelebrateWinner} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p className="muted">Past winners will appear here as more draws are completed.</p>
          )
        ) : null}
      </section>

      <section className="stack">
        <div className="section-head">
          <h2>Latest Winner Testimonials</h2>
        </div>
        <div className="grid three">
          {latestTestimonials.length ? latestTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              onViewImages={onViewTestimonialImages}
            />
          )) : (
            <article className="card">
              <p className="muted">Latest testimonials will appear here as winners submit their proof.</p>
            </article>
          )}
        </div>
      </section>

      <section className="card stack">
        <div className="row spread">
          <div>
            <h2>Past Testimonials</h2>
            <p className="muted">Older testimonial proofs are grouped here so only the latest 3 stay highlighted.</p>
          </div>
          <button type="button" className="btn btn-soft" onClick={() => setShowPastTestimonials((prev) => !prev)}>
            {showPastTestimonials ? 'Hide Past Testimonials' : 'View Past Testimonials'}
          </button>
        </div>
        {showPastTestimonials ? (
          Object.entries(groupedPastTestimonials).length ? (
            Object.entries(groupedPastTestimonials).map(([date, group]) => (
              <section key={date} className="stack">
                <p className="eyebrow">{date}</p>
                <div className="grid three">
                  {group.map((testimonial) => (
                    <TestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                      onViewImages={onViewTestimonialImages}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p className="muted">Past testimonials will appear here as more winners submit their proof.</p>
          )
        ) : null}
      </section>
    </section>
  )
}

export default Winners
