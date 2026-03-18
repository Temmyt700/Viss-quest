import { useState } from 'react'
import SpinWheel from '../components/SpinWheel'
import QuizCard from '../components/QuizCard'
import { formatCurrency } from '../utils/format'
import './DailyChances.css'

function DailyChances({
  rewards,
  spinCost,
  spinState,
  walletBalance,
  onSpin,
  onCloseResultModal,
  quiz,
  quizState,
  onSubmitAnswer,
  isLoading,
}) {
  const [activeTab, setActiveTab] = useState('spin')

  return (
    <section className="stack-lg">
      <header className="card daily-chances-hero">
        <div className="daily-chances-badges" aria-hidden="true">
          <span className="daily-chances-badge">Play Today</span>
          <span className="daily-chances-badge daily-chances-badge-soft">Spin + Quiz</span>
        </div>
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
          <section className="card spin-summary-card">
            {isLoading ? (
              <div className="stack">
                <div className="skeleton-line skeleton-line-title" />
                <div className="skeleton-line" />
              </div>
            ) : (
              <>
                <p className="muted">
                  <strong>Wallet Balance:</strong> {formatCurrency(walletBalance)}
                </p>
                <p className="muted">
                  <strong>Spin Cost:</strong> {formatCurrency(spinCost)}. Paid spins left today: {spinState.remainingTotalSpins}.
                  {spinState.availableFreeSpins > 0 ? ` Free spins available now: ${spinState.availableFreeSpins}.` : ''}
                </p>
              </>
            )}
          </section>
          <SpinWheel
            rewards={rewards}
            isSpinning={spinState.isSpinning}
            isPriming={spinState.isPriming}
            rotation={spinState.rotation}
            disabled={
              isLoading ||
              !spinState.canSpin ||
              spinState.isSpinning ||
              (spinState.availableFreeSpins < 1 && walletBalance < spinCost)
            }
            onSpin={onSpin}
            isLoading={isLoading}
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
          <QuizCard quiz={quiz} state={quizState} onSubmit={onSubmitAnswer} isLoading={isLoading} />
          <section className="card quiz-status-card">
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
