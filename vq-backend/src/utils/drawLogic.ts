export const getAutomatedStatus = (
  currentEntries: number,
  maxEntries: number,
  endTime: Date,
  now: Date,
) => {
  if (endTime.getTime() <= now.getTime()) return "closed";
  if (currentEntries >= maxEntries) return "filled";

  const ratio = maxEntries > 0 ? currentEntries / maxEntries : 0;
  if (ratio >= 0.95) return "limited_slots";
  if (ratio >= 0.75) return "closing_soon";
  if (ratio >= 0.5) return "almost_filled";
  return "available";
};
