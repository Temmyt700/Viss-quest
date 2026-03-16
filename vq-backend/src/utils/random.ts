import { randomInt } from "node:crypto";

export const pickRandomItem = <T>(items: T[]) => {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty collection.");
  }

  const index = randomInt(0, items.length);
  return items[index];
};
