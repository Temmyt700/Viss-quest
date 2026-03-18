import { randomInt } from "node:crypto";

export const pickRandomItem = <T>(items: T[]) => {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty collection.");
  }

  const index = randomInt(0, items.length);
  return items[index];
};

export const pickRandomItems = <T>(items: T[], count: number) => {
  if (count <= 0) {
    return [];
  }

  const pool = [...items];
  const selected: T[] = [];
  const targetCount = Math.min(count, pool.length);

  while (selected.length < targetCount) {
    const index = randomInt(0, pool.length);
    selected.push(pool[index]);
    pool.splice(index, 1);
  }

  return selected;
};
