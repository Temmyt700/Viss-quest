function AdminCreateDraw() {
  return (
    <section className="stack-lg">
      <h1>Create Draw</h1>
      <form className="card auth-card">
        <label>
          Prize Title
          <input type="text" placeholder="Laptop Draw" />
        </label>
        <label>
          Entry Fee
          <input type="number" placeholder="1000" />
        </label>
        <label>
          Draw Day
          <select>
            <option>Monday</option>
            <option>Wednesday</option>
            <option>Friday</option>
          </select>
        </label>
        <label>
          Prize Image URL
          <input type="url" placeholder="https://..." />
        </label>
        <button type="button" className="btn btn-primary">
          Create Draw
        </button>
      </form>
    </section>
  )
}

export default AdminCreateDraw

