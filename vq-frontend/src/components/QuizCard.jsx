import { useState } from 'react'
import './QuizCard.css'

const quiz = {
  question: 'Who is the current President of Nigeria?',
  options: ['Bola Tinubu', 'Muhammadu Buhari', 'Goodluck Jonathan', 'Atiku Abubakar'],
  correctAnswer: 'Bola Tinubu',
  reward: 100,
}

function QuizCard({ state, onSubmit }) {
  const [selectedOption, setSelectedOption] = useState('')

  const handleSubmit = () => {
    if (!selectedOption || state.answered) return
    const isCorrect = selectedOption === quiz.correctAnswer
    onSubmit(isCorrect, quiz.reward)
  }

  return (
    <section className="card quiz-card">
      <p className="eyebrow">Daily Quiz</p>
      <h3>{quiz.question}</h3>
      <div className="quiz-options">
        {quiz.options.map((option) => (
          <label key={option} className="option-item">
            <input
              type="radio"
              name="quiz-option"
              value={option}
              onChange={() => setSelectedOption(option)}
              disabled={state.answered}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={state.answered}>
        Submit Answer
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
