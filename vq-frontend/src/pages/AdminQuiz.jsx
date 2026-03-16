import { useEffect, useState } from 'react'

const emptyFormState = {
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  rewardAmount: '',
  goLiveMode: 'instant',
  scheduledAt: '',
}

function AdminQuiz({ scheduledQuizzes, onCreateQuiz, onUpdateQuiz, onDeleteQuiz, onPublishQuiz }) {
  const [formState, setFormState] = useState(emptyFormState)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const updateField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (!editingQuiz) {
      setFormState(emptyFormState)
      return
    }

    setFormState({
      question: editingQuiz.question,
      optionA: editingQuiz.optionA || '',
      optionB: editingQuiz.optionB || '',
      optionC: editingQuiz.optionC || '',
      optionD: editingQuiz.optionD || '',
      correctAnswer: editingQuiz.correctAnswer || 'A',
      rewardAmount: String(editingQuiz.rewardAmount || ''),
      goLiveMode: editingQuiz.goLiveMode || 'instant',
      scheduledAt: editingQuiz.scheduledAt ? new Date(editingQuiz.scheduledAt).toISOString().slice(0, 16) : '',
    })
  }, [editingQuiz])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    try {
      if (editingQuiz) {
        await onUpdateQuiz(editingQuiz.id, formState)
      } else {
        await onCreateQuiz(formState)
      }
      setEditingQuiz(null)
      setFormState(emptyFormState)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Daily Quiz Scheduling</h1>
        <p className="muted">
          Schedule quizzes ahead of time. When a new quiz goes live, it replaces the previous active quiz.
        </p>
      </header>
      <form className="card auth-card" onSubmit={handleSubmit}>
        <label>
          Question
          <textarea
            rows="3"
            placeholder="Who is the current President of Nigeria?"
            value={formState.question}
            onChange={(event) => updateField('question', event.target.value)}
          />
        </label>
        <div className="grid two">
          <label>
            Option A
            <input type="text" value={formState.optionA} onChange={(event) => updateField('optionA', event.target.value)} />
          </label>
          <label>
            Option B
            <input type="text" value={formState.optionB} onChange={(event) => updateField('optionB', event.target.value)} />
          </label>
          <label>
            Option C
            <input type="text" value={formState.optionC} onChange={(event) => updateField('optionC', event.target.value)} />
          </label>
          <label>
            Option D
            <input type="text" value={formState.optionD} onChange={(event) => updateField('optionD', event.target.value)} />
          </label>
        </div>
        <div className="grid two">
          <label>
            Correct Answer
            <select value={formState.correctAnswer} onChange={(event) => updateField('correctAnswer', event.target.value)}>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>
          </label>
          <label>
            Reward Amount
            <input type="number" value={formState.rewardAmount} onChange={(event) => updateField('rewardAmount', event.target.value)} />
          </label>
        </div>
        <label>
          Go Live Mode
          <select value={formState.goLiveMode} onChange={(event) => updateField('goLiveMode', event.target.value)}>
            <option value="instant">Go Live Instantly</option>
            <option value="schedule">Schedule Go Live</option>
          </select>
        </label>
        {formState.goLiveMode === 'schedule' ? (
          <label>
            Scheduled Time
            <input type="datetime-local" value={formState.scheduledAt} onChange={(event) => updateField('scheduledAt', event.target.value)} />
          </label>
        ) : null}
        <div className="row">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving quiz...' : editingQuiz ? 'Save Quiz Changes' : formState.goLiveMode === 'instant' ? 'Publish Quiz Now' : 'Schedule Quiz'}
          </button>
          {editingQuiz ? (
            <button type="button" className="btn btn-soft" onClick={() => setEditingQuiz(null)}>
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>
      <div className="table-wrap card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Reward</th>
              <th>Scheduled Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scheduledQuizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td>{quiz.question}</td>
                <td>N {quiz.rewardAmount.toLocaleString()}</td>
                <td>{quiz.scheduledTime}</td>
                <td>{quiz.status || 'scheduled'}</td>
                <td>
                  <div className="user-actions">
                    <button type="button" className="btn btn-soft" onClick={() => setEditingQuiz(quiz)}>
                      View
                    </button>
                    <button type="button" className="btn btn-soft" onClick={() => onPublishQuiz(quiz.id)}>
                      Publish
                    </button>
                    <button type="button" className="btn btn-soft" onClick={() => onDeleteQuiz(quiz.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminQuiz
