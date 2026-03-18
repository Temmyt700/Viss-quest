import { useEffect, useMemo, useState } from 'react'
import './DrawForm.css'

const emptyFormState = {
  title: '',
  description: '',
  entryFee: '',
  prizeValue: '',
  maxEntries: '',
  winnerCount: '1',
  manualStatus: 'Available',
  imageUrl: '',
  galleryImageUrls: '',
  imageFile: null,
  goLiveMode: 'instant',
  drawDay: 'Monday',
  scheduledAt: '',
  endTime: '',
}

const validateImageUrl = (imageUrl) =>
  new Promise((resolve, reject) => {
    if (!imageUrl) {
      resolve()
      return
    }

    const image = new window.Image()
    const timer = window.setTimeout(() => {
      reject(new Error('We could not load that image URL. Please use a direct image link or upload the image.'))
    }, 5000)

    image.onload = () => {
      window.clearTimeout(timer)
      resolve()
    }
    image.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error('We could not load that image URL. Please use a direct image link or upload the image.'))
    }
    image.src = imageUrl
  })

function DrawForm({ index, existingDraw, onConfirmSlot }) {
  const [formState, setFormState] = useState(emptyFormState)
  const [slotState, setSlotState] = useState('saved as draft')
  const [slotError, setSlotError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isOccupied = useMemo(
    () => Boolean(existingDraw && !['closed', 'deleted'].includes(existingDraw.status)),
    [existingDraw],
  )

  useEffect(() => {
    if (!existingDraw) {
      setSlotState('saved as draft')
      return
    }

    if (existingDraw.status === 'closed') {
      setSlotState('was closed and is available for reuse')
      return
    }

    if (existingDraw.goLiveMode === 'instant') {
      setSlotState(`went live at ${existingDraw.startTime}`)
      return
    }

    setSlotState(`scheduled for ${existingDraw.startTime}`)
  }, [existingDraw])

  const updateField = (field, value) => {
    setSlotError('')
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleConfirm = async () => {
    if (isSaving) return

    if (isOccupied) {
      setSlotError(`Draw Slot ${index + 1} is already live. Edit, close, or delete it before creating another draw here.`)
      return
    }

    setIsSaving(true)
    setSlotError('')

    try {
      const galleryImageUrls = formState.galleryImageUrls
        ? formState.galleryImageUrls.split('\n').map((value) => value.trim()).filter(Boolean).slice(0, 2)
        : []
      await Promise.all([
        validateImageUrl(formState.imageUrl),
        ...galleryImageUrls.map((imageUrl) => validateImageUrl(imageUrl)),
      ])

      const response = await onConfirmSlot(index + 1, formState)
      if (!response) {
        setSlotState('saved as draft')
        return
      }

      if (formState.goLiveMode === 'instant') {
        setSlotState(`went live at ${response.startLabel}`)
      } else if (response.startLabel) {
        setSlotState(`scheduled for ${response.startLabel}`)
      } else {
        setSlotState('saved as draft')
      }

      setFormState(emptyFormState)
    } catch (error) {
      setSlotError(error instanceof Error ? error.message : 'We could not save this draw slot right now.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="card draw-form">
      <div className="row spread">
        <h3>Draw Slot {index + 1}</h3>
        <span className={`status-pill ${isOccupied ? 'status-limited_slots' : ''}`}>
          {isOccupied ? 'Occupied' : 'Available'}
        </span>
      </div>
      <label>
        Prize Title
        <input
          type="text"
          placeholder="Laptop Draw"
          value={formState.title}
          onChange={(event) => updateField('title', event.target.value)}
        />
      </label>
      <label>
        Description
        <textarea
          rows="3"
          placeholder="Prize summary for the draw card and details page."
          value={formState.description}
          onChange={(event) => updateField('description', event.target.value)}
        />
      </label>
      <div className="grid two">
        <label>
          Entry Fee
          <input
            type="number"
            placeholder="1000"
            value={formState.entryFee}
            onChange={(event) => updateField('entryFee', event.target.value)}
          />
        </label>
        <label>
          Prize Value
          <input
            type="number"
            placeholder="350000"
            value={formState.prizeValue}
            onChange={(event) => updateField('prizeValue', event.target.value)}
          />
        </label>
        <label>
          Maximum Entries
          <input
            type="number"
            placeholder="200"
            value={formState.maxEntries}
            onChange={(event) => updateField('maxEntries', event.target.value)}
          />
        </label>
        <label>
          Number Of Winners
          <input
            type="number"
            min="1"
            max="50"
            placeholder="1"
            value={formState.winnerCount}
            onChange={(event) => updateField('winnerCount', event.target.value)}
          />
        </label>
        <label>
          Manual Status
          <select value={formState.manualStatus} onChange={(event) => updateField('manualStatus', event.target.value)}>
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
          Primary Image URL
          <input
            type="url"
            placeholder="https://..."
            value={formState.imageUrl}
            onChange={(event) => updateField('imageUrl', event.target.value)}
          />
        </label>
        <label className="draw-image-field">
          Extra Image URLs
          <textarea
            rows="3"
            placeholder="Add up to 2 more image URLs, one per line."
            value={formState.galleryImageUrls}
            onChange={(event) => updateField('galleryImageUrls', event.target.value)}
          />
        </label>
        <label className="draw-image-field">
          Upload Up To 3 Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => updateField('imageFile', Array.from(event.target.files || []).slice(0, 3))}
          />
        </label>
      </div>
      <label>
        Go Live Mode
        <select value={formState.goLiveMode} onChange={(event) => updateField('goLiveMode', event.target.value)}>
          <option value="instant">Go Live Instantly</option>
          <option value="schedule">Schedule Go Live</option>
        </select>
      </label>
      <div className="grid two">
        <label>
          Draw Day
          <select value={formState.drawDay} onChange={(event) => updateField('drawDay', event.target.value)}>
            <option>Monday</option>
            <option>Wednesday</option>
            <option>Friday</option>
          </select>
        </label>
        {formState.goLiveMode === 'schedule' ? (
          <label className="date-time-field">
            Start Time
            <input
              type="datetime-local"
              value={formState.scheduledAt}
              onChange={(event) => updateField('scheduledAt', event.target.value)}
            />
          </label>
        ) : null}
        <label className="date-time-field">
          End Time
          <input
            type="datetime-local"
            value={formState.endTime}
            onChange={(event) => updateField('endTime', event.target.value)}
          />
        </label>
      </div>
      {slotError ? <p className="form-error">{slotError}</p> : null}
      <button
        type="button"
        className={`btn btn-primary ${isSaving ? 'is-loading' : ''}`}
        onClick={handleConfirm}
        disabled={isSaving || isOccupied}
        aria-busy={isSaving}
      >
        {isSaving ? (
          <>
            <span className="btn-spinner" aria-hidden="true" />
            Saving draw...
          </>
        ) : (
          `Confirm Draw Slot ${index + 1}`
        )}
      </button>
      <div className="draw-slot-history">
        <strong>Draw Slot {index + 1}</strong> {slotState}
      </div>
    </section>
  )
}

export default DrawForm
