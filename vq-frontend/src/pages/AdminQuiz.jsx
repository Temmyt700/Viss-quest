import { useState } from 'react'
import AdminTable from '../components/AdminTable'

function AdminQuiz({ scheduledQuizzes }) {
  const [goLiveMode, setGoLiveMode] = useState('instant')

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Daily Quiz Scheduling</h1>
        <p className="muted">
          Schedule quizzes ahead of time. Each quiz stays active for 24 hours, then the next one
          activates automatically.
        </p>
      </header>
      <form className="card auth-card">
        <label>
          Question
          <textarea rows="3" placeholder="Who is the current President of Nigeria?" />
        </label>
        <div className="grid two">
          <label>
            Option A
            <input type="text" placeholder="Bola Tinubu" />
          </label>
          <label>
            Option B
            <input type="text" placeholder="Muhammadu Buhari" />
          </label>
          <label>
            Option C
            <input type="text" placeholder="Goodluck Jonathan" />
          </label>
          <label>
            Option D
            <input type="text" placeholder="Atiku Abubakar" />
          </label>
        </div>
        <div className="grid two">
          <label>
            Correct Answer
            <select>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>
          </label>
          <label>
            Reward Amount
            <input type="number" placeholder="50" />
          </label>
        </div>
        <label>
          Go Live Mode
          <select value={goLiveMode} onChange={(event) => setGoLiveMode(event.target.value)}>
            <option value="instant">Go Live Instantly</option>
            <option value="schedule">Schedule Go Live</option>
          </select>
        </label>
        {goLiveMode === 'schedule' ? (
          <label>
            Scheduled Time
            <input type="datetime-local" />
          </label>
        ) : null}
        <button type="button" className="btn btn-primary">
          {goLiveMode === 'instant' ? 'Publish Quiz Now' : 'Schedule Quiz'}
        </button>
      </form>
      <AdminTable
        columns={[
          { key: 'question', label: 'Question' },
          { key: 'rewardAmount', label: 'Reward' },
          { key: 'scheduledTime', label: 'Scheduled Time' },
          { key: 'activeWindow', label: 'Active Window' },
        ]}
        rows={scheduledQuizzes}
      />
    </section>
  )
}

export default AdminQuiz
