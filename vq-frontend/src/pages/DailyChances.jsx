import { useState } from 'react'
import SpinWheel from '../components/SpinWheel'
import QuizCard from '../components/QuizCard'
import { formatCurrency } from '../utils/format'
import './DailyChances.css'

function DailyChances({
  rewards,
  spinState,
  walletBalance,
  onSpin,
  onCloseResultModal,
  quizState,
  onSubmitAnswer,
}) {
  const [activeTab, setActiveTab] = useState('spin')

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Daily Chances</h1>
        <p className="muted">Use Daily Spin and Daily Quiz in one place.</p>
      </header>

      <div className="chance-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'spin' ? 'active' : ''}`}
          onClick={() => setActiveTab('spin')}
        >
          Daily Spin
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          Daily Quiz
        </button>
      </div>

      {activeTab === 'spin' ? (
        <section className="stack">
          <section className="card">
            <p className="muted">Wallet Balance: {formatCurrency(walletBalance)}</p>
            <p className="muted">Spin cost: N 15. You can only spin once per day.</p>
          </section>
          <SpinWheel
            rewards={rewards}
            isSpinning={spinState.isSpinning}
            rotation={spinState.rotation}
            disabled={spinState.hasSpunToday || spinState.isSpinning || walletBalance < 15}
            onSpin={onSpin}
          />
          {spinState.showResultModal && spinState.result ? (
            <div className="modal-overlay" role="dialog" aria-modal="true">
              <div className="modal-card">
                <h3>Spin Result</h3>
                <p className="result-success">{spinState.result.label}</p>
                <button type="button" className="btn btn-primary" onClick={onCloseResultModal}>
                  Continue
                </button>
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="stack">
          <QuizCard state={quizState} onSubmit={onSubmitAnswer} />
          <section className="card">
            <h3>Today&apos;s Quiz Status</h3>
            <p className="muted">{quizState.answered ? 'Answered' : 'Not answered yet'}</p>
            <h3>Reward Earned Today</h3>
            <p className="result-success">N {quizState.reward.toLocaleString()}</p>
          </section>
        </section>
      )}
    </section>
  )
}

export default DailyChances
