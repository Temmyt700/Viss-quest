import './SpinWheel.css'

function SpinWheel({ rewards, isSpinning, rotation, disabled, onSpin }) {
  const segmentAngle = 360 / rewards.length

  return (
    <section className="card spin-card">
      <div className="spin-stage">
        <div className="spin-pointer" />
        <div
          className={`spin-wheel ${isSpinning ? 'spin' : ''}`}
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
        {isSpinning ? 'Spinning...' : disabled ? 'Spin unavailable for now.' : 'Tap the center button to spin.'}
      </p>
    </section>
  )
}

export default SpinWheel
