export const FUNDING_AMOUNTS = [500, 850, 1200, 2000, 3500, 5500, 10000]

export const BANK_ACCOUNTS = [
  {
    id: 'bank1',
    bankName: 'Providus Bank',
    accountName: 'VissQuest Technologies',
    accountNumber: '1234567890',
  },
  {
    id: 'bank2',
    bankName: 'Moniepoint MFB',
    accountName: 'VissQuest Collections',
    accountNumber: '1029384756',
  },
]

export const SUPPORT_CONTACT = {
  whatsapp: '+2348012345678',
  email: 'support@vissquest.com',
}

export const DRAW_ITEMS = [
  {
    id: 'd1',
    drawId: 'VQD-001',
    title: 'Laptop Draw',
    description: 'Premium productivity laptop for weekday hustlers.',
    entryFee: 1000,
    prizeValue: 850000,
    maxEntries: 200,
    currentEntries: 152,
    status: 'almost_filled',
    manualStatus: '',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    startTime: '2026-03-13T09:00:00',
    endTime: '2026-03-13T20:00:00',
    createdAt: '2026-03-12T08:00:00',
    drawDay: 'Friday',
    goLiveMode: 'schedule',
    goLiveAt: '2026-03-12 09:00',
  },
  {
    id: 'd2',
    drawId: 'VQD-002',
    title: 'Smartphone Draw',
    description: 'Flagship smartphone with crisp camera performance.',
    entryFee: 700,
    prizeValue: 620000,
    maxEntries: 500,
    currentEntries: 476,
    status: 'closing_soon',
    manualStatus: '',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    startTime: '2026-03-13T10:00:00',
    endTime: '2026-03-13T18:30:00',
    createdAt: '2026-03-12T08:15:00',
    drawDay: 'Friday',
    goLiveMode: 'instant',
    goLiveAt: 'Live now',
  },
  {
    id: 'd3',
    drawId: 'VQD-003',
    title: 'Cash Prize Draw',
    description: 'Straight cash payout for one lucky entrant.',
    entryFee: 500,
    prizeValue: 50000,
    maxEntries: 1000,
    currentEntries: 948,
    status: 'limited_slots',
    manualStatus: '',
    image:
      'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=900&q=80',
    startTime: '2026-03-13T11:00:00',
    endTime: '2026-03-13T17:00:00',
    createdAt: '2026-03-12T08:25:00',
    drawDay: 'Friday',
    goLiveMode: 'schedule',
    goLiveAt: '2026-03-12 13:00',
  },
]

export const SPIN_REWARDS = [
  { id: 's1', type: 'cash', amount: 1000, label: 'N 1,000' },
  { id: 's2', type: 'cash', amount: 500, label: 'N 500' },
  { id: 's3', type: 'cash', amount: 100, label: 'N 100' },
  { id: 's4', type: 'free_entry', amount: 0, label: 'Free Entry' },
  { id: 's5', type: 'none', amount: 0, label: 'Try Again' },
]

export const WINNERS = [
  {
    id: 'w1',
    userId: 'u1',
    referenceId: 'VQ024',
    date: 'March 12, 2026',
    prizeTitle: 'Laptop Draw',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'w2',
    userId: 'u2',
    referenceId: 'VQ112',
    date: 'March 10, 2026',
    prizeTitle: 'Cash Prize Draw',
    image:
      'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'w3',
    userId: 'u3',
    referenceId: 'VQ078',
    date: 'March 8, 2026',
    prizeTitle: 'Smartphone Draw',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  },
]

export const NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Laptop draw winner announced',
    message: 'VQ024 has been announced as the latest Laptop Draw winner.',
    timestamp: '10 mins ago',
  },
  {
    id: 'n2',
    title: 'New draw available',
    message: 'A fresh Friday cash draw is now live with limited slots.',
    timestamp: '1 hour ago',
  },
  {
    id: 'n3',
    title: 'Admin announcement',
    message: 'Always include your Reference ID in transfer narration to avoid delays.',
    timestamp: 'Today, 8:15 AM',
  },
]

export const TESTIMONIALS = [
  {
    id: 'tm1',
    userId: 'u1',
    referenceId: 'VQ024',
    prizeTitle: 'Laptop Draw',
    winningDate: 'March 12, 2026',
    message: 'Yes I received my prize and VissQuest is legit.',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=80',
    ],
  },
]

export const USERS = [
  {
    id: 'u1',
    fullName: 'Ada Obi',
    referenceId: 'VQ024',
    email: 'ada@example.com',
    phone: '+2348012345678',
    walletBalance: 1200,
    accountStatus: 'Active',
    role: 'user',
    wins: 1,
    participations: 4,
  },
  {
    id: 'u2',
    fullName: 'Ifeoma Paul',
    referenceId: 'VQ112',
    email: 'ifeoma@example.com',
    phone: '+2348099988877',
    walletBalance: 850,
    accountStatus: 'Active',
    role: 'moderator',
    wins: 0,
    participations: 3,
  },
  {
    id: 'u3',
    fullName: 'Tobi Adebayo',
    referenceId: 'VQ078',
    email: 'tobi@example.com',
    phone: '+2348033344455',
    walletBalance: 0,
    accountStatus: 'Suspended',
    role: 'user',
    wins: 1,
    participations: 1,
  },
]

export const QUIZ_SCHEDULE = [
  {
    id: 'q1',
    question: 'Who is the current President of Nigeria?',
    optionA: 'Bola Tinubu',
    optionB: 'Muhammadu Buhari',
    optionC: 'Goodluck Jonathan',
    optionD: 'Atiku Abubakar',
    correctAnswer: 'A',
    rewardAmount: 100,
    scheduledTime: '2026-03-12 09:00',
    activeWindow: '24 hours',
  },
  {
    id: 'q2',
    question: 'What color is in the VissQuest brand gradient?',
    optionA: 'Red',
    optionB: 'Green',
    optionC: 'Blue',
    optionD: 'Orange',
    correctAnswer: 'B',
    rewardAmount: 50,
    scheduledTime: '2026-03-13 09:00',
    activeWindow: '24 hours',
  },
]

export const WALLET_STATS = {
  totalWalletBalance: 265000,
  totalDeposits: 540000,
  totalSpentOnEntries: 122000,
  totalSpentOnSpins: 18500,
  totalRewardsPaid: 64000,
}

export const INITIAL_DEPOSITS = [
  {
    id: 'dep1',
    userId: 'u1',
    referenceId: 'VQ024',
    amount: 10000,
    timestamp: 'Mar 10, 2026 10:22 AM',
    status: 'Pending',
  },
  {
    id: 'dep2',
    userId: 'u2',
    referenceId: 'VQ112',
    amount: 5500,
    timestamp: 'Mar 10, 2026 08:12 AM',
    status: 'Approved',
  },
]

export const USER_HISTORY = {
  u1: {
    transactions: [
      { id: 'ut1', date: 'Mar 10, 2026', type: 'Deposit', amount: 5000, status: 'Approved' },
      { id: 'ut2', date: 'Mar 10, 2026', type: 'Entry Fee', amount: -500, status: 'Completed' },
    ],
    participations: [
      { id: 'up1', draw: 'Cash Prize Draw', date: 'Mar 10, 2026', status: 'Entered' },
      { id: 'up2', draw: 'Laptop Draw', date: 'Mar 12, 2026', status: 'Entered' },
    ],
    wins: [{ id: 'uw1', prize: 'Laptop Draw', date: 'March 12, 2026' }],
  },
}
