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

  useEffect(() => {
    setSettingsForm({
      spinCost: spinSettings.spinCost,
      maxDailyPayout: spinSettings.maxDailyPayout,
      maxSingleReward: spinSettings.maxSingleReward,
      dailySpinLimit: spinSettings.dailySpinLimit,
    })
    setRewardDrafts(spinSettings.rewards)
  }, [spinSettings])

  const updateSetting = (field, value) => {
    setSettingsForm((prev) => ({ ...prev, [field]: Number(value) }))
  }

  const updateReward = (rewardId, field, value) => {
    setRewardDrafts((prev) =>
      prev.map((reward) => (reward.id === rewardId ? { ...reward, [field]: value } : reward)),
    )
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
          <button type="button" className="btn btn-primary" onClick={() => onSaveSettings(settingsForm)}>
            Save Spin Rules
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
              <button type="button" className="btn btn-soft" onClick={() => onSaveReward(reward.id, reward)}>
                Save Reward
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export default AdminSpinSettings
