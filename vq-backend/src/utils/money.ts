export const toNumber = (value: string | number) =>
  typeof value === "number" ? value : Number.parseFloat(value);

export const assertPositiveAmount = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Amount must be a positive number.");
  }
};
