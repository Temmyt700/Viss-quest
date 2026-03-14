export const pickRandomItem = <T>(items: T[]) => {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty collection.");
  }

  const index = Math.floor(Math.random() * items.length);
  return items[index];
};
