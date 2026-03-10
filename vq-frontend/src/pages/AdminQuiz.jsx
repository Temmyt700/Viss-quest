function AdminQuiz() {
  return (
    <section className="stack-lg">
      <h1>Daily Quiz</h1>
      <form className="card auth-card">
        <label>
          Question
          <textarea rows="3" placeholder="Who is the current President of Nigeria?" />
        </label>
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
          <input type="text" placeholder="Olusegun Obasanjo" />
        </label>
        <label>
          Correct Option
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
        <button type="button" className="btn btn-primary">
          Publish Daily Quiz
        </button>
      </form>
    </section>
  )
}

export default AdminQuiz

