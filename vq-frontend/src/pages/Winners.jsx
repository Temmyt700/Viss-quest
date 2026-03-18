import { useEffect, useMemo, useState } from 'react'
import WinnerCard from '../components/WinnerCard'
import TestimonialCard from '../components/TestimonialCard'
import './Winners.css'

const SLOT_TABS = [1, 2, 3]

function Winners({ winners, testimonials, onViewTestimonialImages, onCelebrateWinner }) {
  const [activeLatestSlot, setActiveLatestSlot] = useState(1)
  const [activePastSlot, setActivePastSlot] = useState(1)
  const [showPastWinners, setShowPastWinners] = useState(false)
  const [showPastTestimonials, setShowPastTestimonials] = useState(false)

  const latestTestimonials = testimonials.slice(0, 3)
  const pastTestimonials = testimonials.slice(3)
  const winnersBySlot = useMemo(() => {
    return SLOT_TABS.reduce((groups, slotNumber) => {
      const slotWinners = winners.filter((winner) => winner.slotNumber === slotNumber)
      const drawGroups = []
      const seenDrawIds = new Map()

      // Winners are already sorted newest-first from the backend. We keep that
      // order and group by draw so each slot can support many winners now and
      // scale later without changing the UI model again.
      for (const winner of slotWinners) {
        if (!seenDrawIds.has(winner.drawId)) {
          const nextGroup = {
            drawId: winner.drawId,
            drawTitle: winner.drawTitle || winner.prizeTitle,
            date: winner.date,
            winners: [],
          }
          seenDrawIds.set(winner.drawId, nextGroup)
          drawGroups.push(nextGroup)
        }

        seenDrawIds.get(winner.drawId).winners.push(winner)
      }

      groups[slotNumber] = {
        latestGroup: drawGroups[0] || null,
        pastGroups: drawGroups.slice(1),
      }
      return groups
    }, {})
  }, [winners])
  const groupedPastTestimonials = useMemo(() => {
    return pastTestimonials.reduce((groups, testimonial) => {
      const key = testimonial.winningDate || 'Recent'
      groups[key] = groups[key] || []
      groups[key].push(testimonial)
      return groups
    }, {})
  }, [pastTestimonials])

  const firstPastWinnerSlot = useMemo(
    () => SLOT_TABS.find((slotNumber) => (winnersBySlot[slotNumber]?.pastGroups.length || 0) > 0) || 1,
    [winnersBySlot],
  )
  const latestSlotView = winnersBySlot[activeLatestSlot] || { latestGroup: null, pastGroups: [] }
  const pastSlotView = winnersBySlot[activePastSlot] || { latestGroup: null, pastGroups: [] }

  useEffect(() => {
    if (showPastWinners && !pastSlotView.pastGroups.length && firstPastWinnerSlot !== activePastSlot) {
      setActivePastSlot(firstPastWinnerSlot)
    }
  }, [activePastSlot, firstPastWinnerSlot, pastSlotView.pastGroups.length, showPastWinners])

  return (
    <section className="stack-lg">
      <header className="card winners-hero">
        <div className="winners-hero-badges" aria-hidden="true">
          <span className="winners-hero-badge">Hall of Luck</span>
          <span className="winners-hero-badge winners-hero-badge-soft">By Slot</span>
        </div>
        <h1>Winners History</h1>
        <p className="muted">Latest and past winners are organised by slot so each slot can surface many winners cleanly.</p>
      </header>

      <section className="stack">
        <div className="section-head">
          <div>
            <p className="winners-section-kicker">Latest Winners</p>
            <h2>Fresh Lucky Moments</h2>
          </div>
        </div>
        <div className="winner-slot-tabs" role="tablist" aria-label="Latest winners by slot">
          {SLOT_TABS.map((slotNumber) => (
            <button
              key={`latest-slot-${slotNumber}`}
              type="button"
              className={`btn ${activeLatestSlot === slotNumber ? 'btn-primary' : 'btn-soft'} winner-slot-tab`}
              onClick={() => setActiveLatestSlot(slotNumber)}
            >
              Slot {slotNumber}
            </button>
          ))}
        </div>
        {latestSlotView.latestGroup ? (
          <section className="slot-section-card card stack">
            <div>
              <p className="eyebrow">Slot {activeLatestSlot}</p>
              <h3>{latestSlotView.latestGroup.drawTitle}</h3>
              <p className="muted">All winners from the most recently announced draw in this slot.</p>
            </div>
            <div className="winner-list">
              {latestSlotView.latestGroup.winners.map((winner) => (
                <WinnerCard key={winner.id} winner={winner} variant="homepage" onCelebrate={onCelebrateWinner} />
              ))}
            </div>
          </section>
        ) : (
          <article className="card">
            <p className="muted">Latest winners will appear here as soon as Slot {activeLatestSlot} announces a draw.</p>
          </article>
        )}
      </section>

      <section className="card stack">
        <div className="section-head">
          <div>
            <p className="winners-section-kicker">Past Winners</p>
            <h2>Winner Archive</h2>
            <p className="muted">Older winner groups stay organised by slot and draw so browsing remains scalable.</p>
          </div>
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => {
              setShowPastWinners((prev) => {
                const next = !prev
                if (next) {
                  setActivePastSlot(firstPastWinnerSlot)
                }
                return next
              })
            }}
          >
            {showPastWinners ? 'Hide Past Winners' : 'View Past Winners'}
          </button>
        </div>
        {showPastWinners ? (
          <>
            <div className="winner-slot-tabs" role="tablist" aria-label="Past winners by slot">
              {SLOT_TABS.map((slotNumber) => (
                <button
                  key={`past-slot-${slotNumber}`}
                  type="button"
                  className={`btn ${activePastSlot === slotNumber ? 'btn-primary' : 'btn-soft'} winner-slot-tab`}
                  onClick={() => setActivePastSlot(slotNumber)}
                >
                  Slot {slotNumber}
                </button>
              ))}
            </div>
            {pastSlotView.pastGroups.length ? (
              pastSlotView.pastGroups.map((group) => (
                <section key={group.drawId} className="stack slot-history-group">
                  <div>
                    <p className="eyebrow">{group.date}</p>
                    <h3>{group.drawTitle}</h3>
                  </div>
                  <div className="winner-list">
                    {group.winners.map((winner) => (
                      <WinnerCard key={winner.id} winner={winner} variant="homepage" onCelebrate={onCelebrateWinner} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <p className="muted">Past winners will appear here as Slot {activePastSlot} completes more draws.</p>
            )}
          </>
        ) : null}
      </section>

      <section className="stack">
        <div className="section-head">
          <div>
            <p className="winners-section-kicker">Proof From Winners</p>
            <h2>Latest Winner Testimonials</h2>
          </div>
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
