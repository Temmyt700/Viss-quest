const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export function formatDisplayDate(value, fallback = 'Just now') {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return dateTimeFormatter.format(date)
}

export function formatDisplayDay(value, fallback = 'Today') {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return dateFormatter.format(date)
}

export function flattenDraws(draws = []) {
  return draws.flatMap((draw) =>
    (draw.prizes || []).map((prize) => ({
      id: prize.id,
      drawId: draw.id,
      drawRef: draw.drawId,
      slotNumber: draw.slotNumber,
      drawPrizeId: prize.id,
      title: prize.title,
      description: prize.description || draw.description || '',
      entryFee: Number(prize.entryFee || 0),
      prizeValue: Number(prize.prizeValue || 0),
      maxEntries: prize.maxEntries || 0,
      currentEntries: prize.currentEntries || 0,
      status: prize.urgencyStatus || 'available',
      manualStatus: prize.manualStatusOverride || '',
      images: (prize.images || []).map((image) => image.imageUrl || image),
      image: prize.images?.[0]?.imageUrl || prize.imageUrl || '',
      startTime: prize.startTime || draw.startTime,
      endTime: prize.endTime || draw.endTime,
      createdAt: prize.createdAt || draw.createdAt,
      drawDay: draw.drawDay,
      goLiveMode: draw.goLiveMode,
      goLiveAt: draw.startTime || draw.createdAt,
      imageUrl: prize.imageUrl || '',
    })),
  )
}

export function mapNotifications(items = []) {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    message: item.message,
    timestamp: formatDisplayDate(item.createdAt, item.timestamp),
    isRead: item.isRead || false,
  }))
}

export function mapTransactions(items = []) {
  return items.map((item) => ({
    id: item.id,
    date: formatDisplayDate(item.createdAt, item.date),
    type: item.description || item.type || 'Transaction',
    amount: Number(item.amount || 0),
    status: item.status ? item.status[0].toUpperCase() + item.status.slice(1) : 'Completed',
  }))
}

export function mapWinners(items = []) {
  return items.map((item) => ({
    id: item.id,
    drawId: item.drawId,
    userId: item.userId,
    referenceId: item.referenceId,
    date: formatDisplayDay(item.announcedAt, item.date),
    prizeTitle: item.prizeTitle,
    slotNumber: item.slotNumber || null,
    status: item.announcedAt ? 'winner_announced' : 'winner_pending',
    suspenseMessage: item.suspenseMessage || null,
    image: item.imageUrl || '',
  }))
}

export function mapTestimonials(items = []) {
  return items.map((item) => ({
    id: item.id,
    userId: item.userId,
    referenceId: item.referenceId,
    prizeTitle: item.prizeTitle,
    rawWinningDate: item.winningDate,
    winningDate: formatDisplayDay(item.winningDate, item.winningDate),
    createdAt: item.createdAt,
    message: item.message,
    images: (item.images || []).map((image) => image.imageUrl || image),
  }))
}

export function mapBanks(items = []) {
  return items.map((bank) => ({
    id: bank.id,
    bankName: bank.bankName,
    accountName: bank.accountName,
    accountNumber: bank.accountNumber,
  }))
}

export function mapSpinSettings(config) {
  if (!config) {
    return {
      spinCost: 15,
      maxDailyPayout: 5000,
      maxSingleReward: 1000,
      dailySpinLimit: 1,
      rewards: [],
    }
  }

  return {
    spinCost: Number(config.spinCost || 15),
    maxDailyPayout: Number(config.maxDailyPayout || 5000),
    maxSingleReward: Number(config.maxSingleReward || 1000),
    dailySpinLimit: Number(config.dailySpinLimit || 1),
    rewards: (config.rewards || []).map((reward) => ({
      id: reward.id,
      rewardType: reward.rewardType || reward.type,
      type: reward.rewardType || reward.type,
      rewardAmount: Number(reward.rewardAmount || reward.amount || 0),
      amount: Number(reward.rewardAmount || reward.amount || 0),
      label: reward.label,
      maxDailyWinners: reward.maxDailyWinners,
      isActive: reward.isActive,
    })),
  }
}
