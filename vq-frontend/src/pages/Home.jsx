import { useEffect, useMemo, useRef } from 'react'
import PrizeCard from '../components/PrizeCard'
import WinnerCard from '../components/WinnerCard'
import { formatCurrency } from '../utils/format'
import './Home.css'

const entryConfettiPieces = Array.from({ length: 18 }, (_, index) => index)
const winnerPreviewConfettiPieces = Array.from({ length: 34 }, (_, index) => index)

function Home({ draws, winners, serverNow, onViewDraw, onEnterDraw, celebration, onDismissCelebration, onCelebrateWinner, isLoading }) {
  const carouselRef = useRef(null)
  const isPointerDownRef = useRef(false)
  const duplicatedWinners = useMemo(() => (winners.length ? [...winners, ...winners] : []), [winners])

  useEffect(() => {
    const node = carouselRef.current
    if (!node || winners.length < 2) return

    // Latest winners auto-scrolls continuously, but because the container
    // remains horizontally scrollable users can still swipe manually and the
    // carousel resumes afterwards.
    let frameId = 0
    const step = () => {
      if (!isPointerDownRef.current) {
        node.scrollLeft += 0.45
        if (node.scrollLeft >= node.scrollWidth / 2) {
          node.scrollLeft = 0
        }
      }
      frameId = window.requestAnimationFrame(step)
    }

    frameId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frameId)
  }, [winners.length])

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
          {isLoading
            ? Array.from({ length: 3 }, (_, index) => (
                <article key={index} className="card prize-card">
                  <div className="skeleton-block prize-image" />
                  <div className="prize-content stack">
                    <div className="skeleton-line skeleton-line-title" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-line-short" />
                  </div>
                </article>
              ))
            : draws.map((draw) => (
                <PrizeCard
                  key={draw.id}
                  draw={draw}
                  serverNow={serverNow}
                  onViewDraw={onViewDraw}
                  onEnterDraw={onEnterDraw}
                />
              ))}
        </div>
      </section>
      <section className="stack">
        <div className="section-head">
          <h2>Latest Winners</h2>
        </div>
        {winners.length ? (
          <div
            ref={carouselRef}
            className="winners-carousel"
            onMouseDown={() => {
              isPointerDownRef.current = true
            }}
            onMouseUp={() => {
              isPointerDownRef.current = false
            }}
            onMouseLeave={() => {
              isPointerDownRef.current = false
            }}
            onTouchStart={() => {
              isPointerDownRef.current = true
            }}
            onTouchEnd={() => {
              isPointerDownRef.current = false
            }}
          >
            <div className="winners-carousel-track">
              {duplicatedWinners.map((winner, index) => (
                <div key={`${winner.id}-${index}`} className="winner-carousel-item">
                  <WinnerCard winner={winner} variant="homepage" onCelebrate={onCelebrateWinner} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <article className="card">
            <p className="muted">Latest winners will appear here as soon as the next draw is announced.</p>
          </article>
        )}
      </section>
      {celebration ? (
        <div className={`celebration-layer ${celebration.mode === 'winner-preview' ? 'celebration-winner-preview' : 'celebration-entry'}`} role="dialog" aria-modal="true">
          <div className={`confetti-field ${celebration.mode === 'winner-preview' ? 'winner-confetti' : ''}`} aria-hidden="true">
            {(celebration.mode === 'winner-preview' ? winnerPreviewConfettiPieces : entryConfettiPieces).map((piece) => (
              <span
                key={piece}
                className="confetti-piece"
                style={{
                  '--x': `${celebration.mode === 'winner-preview' ? (piece % 10) * 10 : (piece % 6) * 18}%`,
                  '--delay': `${piece * (celebration.mode === 'winner-preview' ? 0.05 : 0.12)}s`,
                  '--duration': `${celebration.mode === 'winner-preview' ? 2.2 + (piece % 5) * 0.22 : 3 + (piece % 4) * 0.4}s`,
                }}
              />
            ))}
          </div>
          <div className="celebration-card card">
            <p className="eyebrow">{celebration.mode === 'winner-preview' ? 'Winner Highlight' : 'Entry Confirmed'}</p>
            <h2>{celebration.mode === 'winner-preview' ? 'Feel the win.' : 'You are in.'}</h2>
            {celebration.fee > 0 ? (
              <p className="muted">
                Your spot for <strong>{celebration.title}</strong> has been secured for{' '}
                <strong>{formatCurrency(celebration.fee)}</strong>.
              </p>
            ) : (
              <p className="muted">
                <strong>{celebration.title}</strong>
              </p>
            )}
            <p className="celebration-copy">{celebration.copy || 'Good luck. The next winner could be you.'}</p>
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
