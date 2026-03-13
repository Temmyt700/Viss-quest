import { useState } from 'react'
import './DrawForm.css'

function DrawForm({ index }) {
  const [goLiveMode, setGoLiveMode] = useState('instant')
  const [slotState, setSlotState] = useState('saved as draft')
  const [scheduledAt, setScheduledAt] = useState('')

  const handleConfirm = () => {
    if (goLiveMode === 'instant') {
      setSlotState(`went live at ${new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`)
      return
    }

    if (scheduledAt) {
      setSlotState(`scheduled for ${new Date(scheduledAt).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`)
      return
    }

    setSlotState('saved as draft')
  }

  return (
    <section className="card draw-form">
      <div className="row spread">
        <h3>Draw Slot {index + 1}</h3>
        <span className="status-pill">3 draws per day</span>
      </div>
      <label>
        Prize Title
        <input type="text" placeholder="Laptop Draw" />
      </label>
      <label>
        Description
        <textarea rows="3" placeholder="Prize summary for the draw card and details page." />
      </label>
      <div className="grid two">
        <label>
          Entry Fee
          <input type="number" placeholder="1000" />
        </label>
        <label>
          Prize Value
          <input type="number" placeholder="350000" />
        </label>
        <label>
          Maximum Entries
          <input type="number" placeholder="200" />
        </label>
        <label>
          Manual Status
          <select>
            <option>Available</option>
            <option>Almost Filled</option>
            <option>Closing Soon</option>
            <option>Limited Slots Remaining</option>
            <option>Filled</option>
          </select>
        </label>
      </div>
      <div className="grid two draw-image-grid">
        <label className="draw-image-field">
          Image URL
          <input type="url" placeholder="https://..." />
        </label>
        <label className="draw-image-field">
          Upload Image
          <input type="file" />
        </label>
      </div>
      <label>
        Go Live Mode
        <select value={goLiveMode} onChange={(event) => setGoLiveMode(event.target.value)}>
          <option value="instant">Go Live Instantly</option>
          <option value="schedule">Schedule Go Live</option>
        </select>
      </label>
      <div className="grid two">
        <label>
          Draw Day
          <select>
            <option>Monday</option>
            <option>Wednesday</option>
            <option>Friday</option>
          </select>
        </label>
        {goLiveMode === 'schedule' ? (
          <label>
            Start Time
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
          </label>
        ) : null}
      </div>
      <button type="button" className="btn btn-primary" onClick={handleConfirm}>
        Confirm Draw Slot {index + 1}
      </button>
      <div className="draw-slot-history">
        <strong>Draw Slot {index + 1}</strong> {slotState}
      </div>
    </section>
  )
}

export default DrawForm
