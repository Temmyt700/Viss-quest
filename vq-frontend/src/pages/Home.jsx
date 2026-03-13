import PrizeCard from '../components/PrizeCard'
import { formatCurrency } from '../utils/format'
import './Home.css'

const confettiPieces = Array.from({ length: 18 }, (_, index) => index)

function Home({ draws, serverNow, onEnterDraw, celebration, onDismissCelebration }) {
  return (
    <section className="stack-lg">
      <section className="hero card">
        <p className="eyebrow">VissQuest</p>
        <h1>Take Chances, Get Lucky, Win Big</h1>
        <p className="muted">
          Join scheduled draws on Monday, Wednesday, and Friday. Enter directly with your wallet and
          track winners by reference ID.
        </p>
      </section>
      <section className="stack">
        <div className="section-head">
          <h2>Active Prize Draws</h2>
        </div>
        <div className="grid three">
          {draws.map((draw) => (
            <PrizeCard key={draw.id} draw={draw} serverNow={serverNow} onEnterDraw={onEnterDraw} />
          ))}
        </div>
      </section>
      {celebration ? (
        <div className="celebration-layer" role="dialog" aria-modal="true">
          <div className="confetti-field" aria-hidden="true">
            {confettiPieces.map((piece) => (
              <span
                key={piece}
                className="confetti-piece"
                style={{
                  '--x': `${(piece % 6) * 18}%`,
                  '--delay': `${piece * 0.12}s`,
                  '--duration': `${3 + (piece % 4) * 0.4}s`,
                }}
              />
            ))}
          </div>
          <div className="celebration-card card">
            <p className="eyebrow">Entry Confirmed</p>
            <h2>You are in.</h2>
            <p className="muted">
              Your spot for <strong>{celebration.title}</strong> has been secured for{' '}
              <strong>{formatCurrency(celebration.fee)}</strong>.
            </p>
            <p className="celebration-copy">Good luck. The next winner could be you.</p>
            <button type="button" className="btn btn-primary" onClick={onDismissCelebration}>
              Keep Exploring
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default Home
