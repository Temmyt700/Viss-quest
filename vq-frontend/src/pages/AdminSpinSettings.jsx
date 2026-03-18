import { useEffect, useState } from 'react'
import './AdminSpinSettings.css'

function AdminSpinSettings({ spinSettings, onSaveSettings, onSaveReward }) {
  const [settingsForm, setSettingsForm] = useState({
    spinCost: 15,
    maxDailyPayout: 5000,
    maxSingleReward: 1000,
    dailySpinLimit: 1,
  })
  const [rewardDrafts, setRewardDrafts] = useState([])
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [savingRewardId, setSavingRewardId] = useState('')
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [savedRewardId, setSavedRewardId] = useState('')
  const [settingsError, setSettingsError] = useState('')
  const [rewardError, setRewardError] = useState({ id: '', message: '' })

  useEffect(() => {
    setSettingsForm({
      spinCost: spinSettings.spinCost,
      maxDailyPayout: spinSettings.maxDailyPayout,
      maxSingleReward: spinSettings.maxSingleReward,
      dailySpinLimit: spinSettings.dailySpinLimit,
    })
    setRewardDrafts(spinSettings.rewards)
    setSettingsSaved(false)
    setSavedRewardId('')
    setSettingsError('')
    setRewardError({ id: '', message: '' })
  }, [spinSettings])

  const sanitizeNonNegative = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
  }

  const sanitizePositiveInteger = (value) => {
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  }

  const updateSetting = (field, value) => {
    setSettingsForm((prev) => ({ ...prev, [field]: Number(value) }))
  }

  const updateReward = (rewardId, field, value) => {
    setRewardDrafts((prev) =>
      prev.map((reward) => (reward.id === rewardId ? { ...reward, [field]: value } : reward)),
    )
  }

  const handleSaveSettings = async () => {
    if (isSavingSettings) return

    const payload = {
      spinCost: sanitizeNonNegative(settingsForm.spinCost),
      maxDailyPayout: sanitizeNonNegative(settingsForm.maxDailyPayout),
      maxSingleReward: sanitizeNonNegative(settingsForm.maxSingleReward),
      dailySpinLimit: sanitizePositiveInteger(settingsForm.dailySpinLimit),
    }

    if (Object.values(payload).some((value) => value === null)) {
      setSettingsError('Please enter valid numbers before saving the spin rules.')
      return
    }

    setSettingsError('')
    setIsSavingSettings(true)
    try {
      await onSaveSettings(payload)
      setSettingsSaved(true)
      window.setTimeout(() => setSettingsSaved(false), 1500)
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : 'Unable to save the spin rules right now.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleSaveReward = async (rewardId, reward) => {
    if (savingRewardId) return

    const payload = {
      label: String(reward.label || '').trim(),
      rewardType: reward.rewardType || reward.type || 'none',
      rewardAmount: sanitizeNonNegative(reward.rewardAmount ?? reward.amount),
      maxDailyWinners: sanitizePositiveInteger(reward.maxDailyWinners || 1),
      isActive: Boolean(reward.isActive),
    }

    if (!payload.label) {
      setRewardError({ id: rewardId, message: 'Reward label cannot be empty.' })
      return
    }

    if (payload.rewardAmount === null || payload.maxDailyWinners === null) {
      setRewardError({ id: rewardId, message: 'Reward amount and max daily winners must be valid numbers.' })
      return
    }

    setRewardError({ id: '', message: '' })
    setSavingRewardId(rewardId)
    try {
      await onSaveReward(rewardId, payload)
      setSavedRewardId(rewardId)
      window.setTimeout(() => {
        setSavedRewardId((current) => (current === rewardId ? '' : current))
      }, 1500)
    } catch (error) {
      setRewardError({
        id: rewardId,
        message: error instanceof Error ? error.message : 'Unable to save this reward right now.',
      })
    } finally {
      setSavingRewardId('')
    }
  }

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Spin Settings</h1>
        <p className="muted">
          Manage spin pricing, reward ceilings, and the reward segments users can land on.
        </p>
      </header>

      <section className="card stack">
        <div className="row spread">
          <h2>Core Rules</h2>
          <button
            type="button"
            className={`btn btn-primary ${isSavingSettings ? 'is-loading' : ''}`}
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
          >
            {isSavingSettings ? 'Saving...' : settingsSaved ? 'Saved' : 'Save Spin Rules'}
          </button>
        </div>
        <div className="grid two">
          <label>
            Spin Price
            <input
              type="number"
              min="0"
              value={settingsForm.spinCost}
              onChange={(event) => updateSetting('spinCost', event.target.value)}
            />
          </label>
          <label>
            Max Daily Reward Payout
            <input
              type="number"
              min="0"
              value={settingsForm.maxDailyPayout}
              onChange={(event) => updateSetting('maxDailyPayout', event.target.value)}
            />
          </label>
          <label>
            Max Single Reward
            <input
              type="number"
              min="0"
              value={settingsForm.maxSingleReward}
              onChange={(event) => updateSetting('maxSingleReward', event.target.value)}
            />
          </label>
          <label>
            Daily Spin Limit
            <input
              type="number"
              min="1"
              value={settingsForm.dailySpinLimit}
              onChange={(event) => updateSetting('dailySpinLimit', event.target.value)}
            />
          </label>
        </div>
        {settingsError ? <p className="form-error">{settingsError}</p> : null}
      </section>

      <section className="card stack">
        <h2>Reward Segments</h2>
        <div className="spin-settings-list">
          {rewardDrafts.map((reward) => (
            <article key={reward.id} className="spin-settings-row">
              <label>
                Label
                <input
                  type="text"
                  value={reward.label}
                  onChange={(event) => updateReward(reward.id, 'label', event.target.value)}
                />
              </label>
              <label>
                Reward Type
                <select
                  value={reward.rewardType || reward.type}
                  onChange={(event) => updateReward(reward.id, 'rewardType', event.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="free_entry">Free Entry</option>
                  <option value="none">No Reward</option>
                  <option value="try_again">Try Again</option>
                </select>
              </label>
              <label>
                Amount
                <input
                  type="number"
                  min="0"
                  value={reward.rewardAmount ?? reward.amount}
                  onChange={(event) => updateReward(reward.id, 'rewardAmount', Number(event.target.value))}
                />
              </label>
              <label>
                Max Daily Winners
                <input
                  type="number"
                  min="1"
                  value={reward.maxDailyWinners || 1}
                  onChange={(event) => updateReward(reward.id, 'maxDailyWinners', Number(event.target.value))}
                />
              </label>
              <label>
                Active
                <select
                  value={reward.isActive ? 'true' : 'false'}
                  onChange={(event) => updateReward(reward.id, 'isActive', event.target.value === 'true')}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
              <button
                type="button"
                className={`btn btn-soft ${savingRewardId === reward.id ? 'is-loading' : ''}`}
                onClick={() => handleSaveReward(reward.id, reward)}
                disabled={Boolean(savingRewardId)}
              >
                {savingRewardId === reward.id ? 'Saving...' : savedRewardId === reward.id ? 'Saved' : 'Save Reward'}
              </button>
              {rewardError.id === reward.id ? <p className="form-error">{rewardError.message}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export default AdminSpinSettings
