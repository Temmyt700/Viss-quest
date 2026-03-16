import { db, sql } from "./client.js";
import { banks, notificationSettings, spinRewards, spinSettings } from "./schema/index.js";

async function seedBanks() {
  const existing = await db.select().from(banks);
  if (existing.length >= 2) {
    return;
  }

  await db.insert(banks).values([
    {
      bankName: "Providus Bank",
      accountName: "VissQuest Technologies",
      accountNumber: "1234567890",
    },
    {
      bankName: "Moniepoint MFB",
      accountName: "VissQuest Collections",
      accountNumber: "1029384756",
    },
  ]).onConflictDoNothing();
}

async function seedSpinSettings() {
  const existing = await db.select().from(spinSettings).limit(1);
  if (existing.length) {
    return;
  }

  await db.insert(spinSettings).values({
    spinCost: "15",
    maxDailyPayout: "5000",
    maxSingleReward: "1000",
    dailySpinLimit: 1,
  });
}

async function seedSpinRewards() {
  const existing = await db.select().from(spinRewards);
  if (existing.length) {
    return;
  }

  await db.insert(spinRewards).values([
    {
      label: "N 1,000",
      rewardType: "cash",
      rewardAmount: "1000",
      maxDailyWinners: 3,
      isActive: true,
    },
    {
      label: "N 500",
      rewardType: "cash",
      rewardAmount: "500",
      maxDailyWinners: 5,
      isActive: true,
    },
    {
      label: "N 100",
      rewardType: "cash",
      rewardAmount: "100",
      maxDailyWinners: 20,
      isActive: true,
    },
    {
      label: "Free Entry",
      rewardType: "free_entry",
      rewardAmount: "0",
      maxDailyWinners: 10,
      isActive: true,
    },
    {
      label: "Try Again",
      rewardType: "none",
      rewardAmount: "0",
      maxDailyWinners: 500,
      isActive: true,
    },
  ]);
}

async function seedNotificationSettings() {
  const existing = await db.select().from(notificationSettings).limit(1);
  if (existing.length) {
    return;
  }

  await db.insert(notificationSettings).values({
    fundingApproved: true,
    prizeWon: true,
    referralReward: true,
  });
}

async function main() {
  await seedSpinSettings();
  await seedBanks();
  await seedSpinRewards();
  await seedNotificationSettings();
  await sql.end({ timeout: 5 });
  console.log("Seed completed.");
}

main().catch(async (error) => {
  console.error(error);
  await sql.end({ timeout: 5 });
  process.exit(1);
});
