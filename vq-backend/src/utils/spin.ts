type SpinHistoryLike = {
  rewardId: string | null;
};

type SpinRewardLike = {
  id: string;
  rewardType: string;
};

export const getSpinAllowance = (
  spins: SpinHistoryLike[],
  rewards: SpinRewardLike[],
  dailySpinLimit: number,
) => {
  const rewardsById = new Map(rewards.map((reward) => [reward.id, reward]));
  let paidSpinsUsed = 0;
  let availableFreeSpins = 0;

  for (const spin of spins) {
    if (availableFreeSpins > 0) {
      availableFreeSpins -= 1;
    } else {
      paidSpinsUsed += 1;
    }

    const rewardType = spin.rewardId ? rewardsById.get(spin.rewardId)?.rewardType : null;
    if (rewardType === "free_entry") {
      availableFreeSpins += 1;
    }
  }

  const remainingPaidSpins = Math.max(dailySpinLimit - paidSpinsUsed, 0);

  return {
    paidSpinsUsed,
    availableFreeSpins,
    totalSpinsUsed: spins.length,
    remainingPaidSpins,
    remainingTotalSpins: remainingPaidSpins + availableFreeSpins,
    hasSpunToday: spins.length > 0,
    canSpin: remainingPaidSpins > 0 || availableFreeSpins > 0,
  };
};
