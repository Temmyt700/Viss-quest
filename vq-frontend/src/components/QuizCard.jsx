import { useEffect, useState } from 'react'
import './QuizCard.css'

function QuizCard({ quiz, state, onSubmit, isLoading }) {
  const [selectedOption, setSelectedOption] = useState('')

  useEffect(() => {
    setSelectedOption('')
  }, [quiz?.id])

  if (isLoading) {
    return (
      <section className="card quiz-card">
        <p className="eyebrow">Daily Quiz</p>
        <div className="stack">
          <div className="skeleton-line skeleton-line-title" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </section>
    )
  }

  if (!quiz) {
    return (
      <section className="card quiz-card">
        <p className="eyebrow">Daily Quiz</p>
        <h3>No quiz is live right now.</h3>
        <p className="muted">The next scheduled quiz will appear automatically when it goes live.</p>
      </section>
    )
  }

  const options = [
    { key: 'A', label: quiz.optionA },
    { key: 'B', label: quiz.optionB },
    { key: 'C', label: quiz.optionC },
    { key: 'D', label: quiz.optionD },
  ]

  const handleSubmit = () => {
    if (!selectedOption || state.answered) return
    onSubmit(selectedOption)
  }

  return (
    <section className="card quiz-card">
      <p className="eyebrow">Daily Quiz</p>
      <h3>{quiz.question}</h3>
      <div className="quiz-options">
        {options.map((option) => (
          <label key={option.key} className="option-item">
            <input
              type="radio"
              name="quiz-option"
              value={option.key}
              onChange={() => setSelectedOption(option.key)}
              checked={selectedOption === option.key}
              disabled={state.answered}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-primary quiz-submit-button"
        onClick={handleSubmit}
        disabled={state.answered}
      >
        {state.answered ? 'Answer Submitted' : 'Submit Answer'}
      </button>
      {state.answered ? (
        <p className={state.isCorrect ? 'result-success' : 'result-muted'}>
          {state.isCorrect
            ? `Correct. You earned N ${state.reward}.`
            : 'Wrong answer. Nice try, please retry tomorrow.'}
        </p>
      ) : null}
    </section>
  )
}

export default QuizCard
