import { useEffect, useMemo, useRef, useState } from 'react'
import Timer from './Timer'
import { formatCurrency } from '../utils/format'
import { getDrawStatusLabel, isDrawEntryOpen } from '../utils/draws'
import './DrawDetailsModal.css'

function DrawDetailsModal({ draw, serverNow, onClose, onEnterDraw }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const touchStartRef = useRef(null)

  const images = useMemo(() => {
    if (!draw) return []
    return (draw.images || [draw.image]).filter(Boolean)
  }, [draw])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [draw?.id])

  if (!draw) return null

  const canEnter = isDrawEntryOpen(draw.status)
  const currentImage = images[activeImageIndex] || draw.image

  const showPrevious = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const showNext = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card draw-details-modal">
        <div className="row spread">
          <div>
            <p className="eyebrow">Draw Details</p>
            <h3>{draw.title}</h3>
          </div>
          <button type="button" className="btn btn-soft" onClick={onClose}>
            Close
          </button>
        </div>
        <div
          className="draw-details-gallery"
          onTouchStart={(event) => {
            touchStartRef.current = event.touches[0]?.clientX ?? null
          }}
          onTouchEnd={(event) => {
            const touchStart = touchStartRef.current
            const touchEnd = event.changedTouches[0]?.clientX ?? null
            if (touchStart == null || touchEnd == null || images.length <= 1) return

            if (touchStart - touchEnd > 40) showNext()
            if (touchEnd - touchStart > 40) showPrevious()
            touchStartRef.current = null
          }}
        >
          <img src={currentImage} alt={draw.title} className="draw-details-image" />
          {images.length > 1 ? (
            <>
              <button type="button" className="draw-gallery-nav prev" onClick={showPrevious} aria-label="Previous image">
                ‹
              </button>
              <button type="button" className="draw-gallery-nav next" onClick={showNext} aria-label="Next image">
                ›
              </button>
              <div className="draw-gallery-dots">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`draw-gallery-dot ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
        <div className="draw-details-grid">
          <div className="status-card">
            <span className={`status-pill draw-status status-${draw.status}`}>{getDrawStatusLabel(draw.status)}</span>
            <strong>Entry Fee: {formatCurrency(draw.entryFee)}</strong>
          </div>
          <div className="status-card">
            <span className="eyebrow">Countdown</span>
            <Timer endTime={draw.endTime} serverNow={serverNow} status={draw.status} />
          </div>
        </div>
        <p className="muted">{draw.description || 'This draw is live on VissQuest and uses automated winner selection.'}</p>
        <button
          type="button"
          className={`btn ${canEnter ? 'btn-primary' : 'btn-disabled'}`}
          onClick={() => onEnterDraw(draw)}
          disabled={!canEnter}
        >
          {canEnter ? 'Enter Draw' : 'Entries Closed'}
        </button>
      </div>
    </div>
  )
}

export default DrawDetailsModal
