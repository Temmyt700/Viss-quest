import './SpinWheel.css'

function SpinWheel({ rewards, isSpinning, isPriming, rotation, disabled, onSpin, isLoading }) {
  if (isLoading) {
    return (
      <section className="card spin-card">
        <div className="spin-stage">
          <div className="spin-loading-shell" aria-hidden="true">
            <div className="skeleton-block spin-shell-skeleton" />
          </div>
        </div>
        <p className="spin-helper">Loading today&apos;s spin...</p>
      </section>
    )
  }

  if (!rewards.length) {
    return (
      <section className="card spin-card">
        <p className="muted">Spin rewards are not configured yet.</p>
      </section>
    )
  }

  const segmentAngle = 360 / rewards.length
  const palette = ['#056608', '#43b446', '#147917', '#52c755', '#248d27', '#77cf7a', '#0d7b10', '#9fdb9f']
  const wheelBackground = `radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0 22%, transparent 22%), conic-gradient(from ${-segmentAngle / 2}deg, ${rewards
    .map((_, index) => {
      const start = index * segmentAngle
      const end = start + segmentAngle
      return `${palette[index % palette.length]} ${start}deg ${end}deg`
    })
    .join(', ')})`

  return (
    <section className="card spin-card">
      <div className="spin-stage">
        <div className="spin-pointer" />
        <div
          className={`spin-wheel ${isSpinning ? 'spin' : ''} ${isPriming ? 'spin-priming' : ''}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            '--segment-angle': `${segmentAngle}deg`,
            background: wheelBackground,
          }}
        >
          {rewards.map((reward, index) => (
            <div
              key={reward.id}
              className="wheel-segment"
              style={{ '--segment-rotation': `${index * (360 / rewards.length)}deg` }}
            >
              <span className="wheel-reward">{reward.label}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`spin-core ${isSpinning ? 'is-spinning' : ''}`}
          onClick={onSpin}
          disabled={disabled}
        >
          <span>{isSpinning ? 'SPINNING' : 'SPIN'}</span>
        </button>
      </div>
      <p className="spin-helper">
        {isSpinning
          ? 'Spinning...'
          : disabled
            ? 'Spin unavailable for now.'
            : 'Tap the center button to spin.'}
      </p>
    </section>
  )
}

export default SpinWheel
