import './SpinWheel.css'

function SpinWheel({ rewards, isSpinning, isPriming, rotation, disabled, onSpin, isLoading }) {
  if (isLoading) {
    return (
      <section className="card spin-card">
        <div className="spin-stage">
          <div className="spin-wheel spin-priming">
            <div className="skeleton-block spin-wheel-skeleton" />
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

  return (
    <section className="card spin-card">
      <div className="spin-stage">
        <div className="spin-pointer" />
        <div
          className={`spin-wheel ${isSpinning ? 'spin' : ''} ${isPriming ? 'spin-priming' : ''}`}
          style={{ transform: `rotate(${rotation}deg)`, '--segment-angle': `${segmentAngle}deg` }}
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
          <span>SPIN</span>
        </button>
      </div>
      <p className="spin-helper">
        {isPriming
          ? 'Checking your spin and getting the wheel ready...'
          : isSpinning
            ? 'Spinning...'
            : disabled
              ? 'Spin unavailable for now.'
              : 'Tap the center button to spin.'}
      </p>
    </section>
  )
}

export default SpinWheel
