export const addHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 60 * 60 * 1000);

export const isSameUtcDay = (left: Date, right: Date) =>
  left.getUTCFullYear() === right.getUTCFullYear() &&
  left.getUTCMonth() === right.getUTCMonth() &&
  left.getUTCDate() === right.getUTCDate();

export const getUtcDayStart = (date = new Date()) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
