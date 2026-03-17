export const DRAW_STATUS_LABELS = {
  active: 'Active',
  available: 'Available',
  almost_filled: 'Almost Filled',
  closing_soon: 'Closing Soon',
  limited_slots: 'Limited Slots Remaining',
  filled: 'Filled',
  closed: 'Closed',
  winner_pending: 'Winner Pending',
  winner_announced: 'Winner Announced',
  completed: 'Completed',
}

export const getDrawStatusLabel = (status) => DRAW_STATUS_LABELS[status] || 'Available'

export const getAutomatedStatus = (currentEntries, maxEntries, endTime, serverNow) => {
  if (new Date(endTime).getTime() <= serverNow) return 'closed'
  if (currentEntries >= maxEntries) return 'filled'

  const ratio = maxEntries > 0 ? currentEntries / maxEntries : 0
  if (ratio >= 0.95) return 'limited_slots'
  if (ratio >= 0.75) return 'closing_soon'
  if (ratio >= 0.5) return 'almost_filled'
  return 'available'
}

export const isDrawEntryOpen = (status) => !['filled', 'closed', 'winner_pending', 'winner_announced', 'completed'].includes(status)
