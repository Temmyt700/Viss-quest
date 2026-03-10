export const DRAW_ITEMS = [
  {
    id: 'd1',
    title: 'Laptop Draw',
    entryFee: 1000,
    status: 'Almost Filled',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    endsAt: '2026-03-12T20:00:00',
  },
  {
    id: 'd2',
    title: 'Smartphone Draw',
    entryFee: 700,
    status: 'Closing Soon',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    endsAt: '2026-03-12T18:30:00',
  },
  {
    id: 'd3',
    title: 'Cash Prize Draw',
    entryFee: 500,
    status: 'Limited Slots Remaining',
    image:
      'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=900&q=80',
    endsAt: '2026-03-12T17:00:00',
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
    referenceId: 'VQ024',
    date: 'March 12, 2026',
    prizeTitle: 'Laptop Draw',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'w2',
    referenceId: 'VQ112',
    date: 'March 10, 2026',
    prizeTitle: 'Cash Prize Draw',
    image:
      'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'w3',
    referenceId: 'VQ078',
    date: 'March 8, 2026',
    prizeTitle: 'Smartphone Draw',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  },
]

