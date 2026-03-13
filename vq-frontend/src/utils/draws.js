export const DRAW_STATUS_LABELS = {
  available: 'Available',
  almost_filled: 'Almost Filled',
  closing_soon: 'Closing Soon',
  limited_slots: 'Limited Slots Remaining',
  filled: 'Filled',
  closed: 'Closed',
  completed: 'Completed',
}

export const getDrawStatusLabel = (status) => DRAW_STATUS_LABELS[status] || 'Available'

export const getAutomatedStatus = (currentEntries, maxEntries, endTime, serverNow) => {
  if (new Date(endTime).getTime() <= serverNow) return 'closed'
  if (currentEntries >= maxEntries) return 'filled'

  const ratio = maxEntries > 0 ? currentEntries / maxEntries : 0
  if (ratio >= 0.95) return 'closing_soon'
  if (ratio >= 0.9) return 'limited_slots'
  if (ratio >= 0.75) return 'almost_filled'
  return 'available'
}

export const isDrawEntryOpen = (status) => !['filled', 'closed', 'completed'].includes(status)
