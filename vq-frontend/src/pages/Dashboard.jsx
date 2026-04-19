import StatsCard from '../components/StatsCard'
import { formatCurrency } from '../utils/format'
import './Dashboard.css'

function Dashboard({ user, recentEntries, notificationsUnreadCount, onNavigate, canOpenTestimonials, testimonial, isLoading }) {
  const referralSummary = user.referralSummary || {
    isActive: true,
    rewardAmount: null,
    referralCode: user.referenceId,
    totalReferrals: 0,
    successfulReferrals: 0,
    totalRewardsEarned: 0,
    recentActivity: [],
  }
  const referralLink = `${window.location.origin}/signup?ref=${referralSummary.referralCode}`
  const hasReferralAmount = typeof referralSummary.rewardAmount === 'number' && Number.isFinite(referralSummary.rewardAmount)
  const referralAmountLabel = hasReferralAmount
    ? `Earn ${formatCurrency(referralSummary.rewardAmount)} per qualified referral`
    : '\u00A0'
  const formatActivityDate = (value) => {
    if (!value) return 'Pending'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? 'Pending' : date.toLocaleDateString()
  }

  return (
    <section className="stack-lg">
      <header className="card">
        <p className="eyebrow">Welcome back</p>
        <h1>{user.referenceId}</h1>
        <p className="muted">{user.fullName}</p>
      </header>

      <div className="grid four">
        <StatsCard label="Wallet Balance" value={isLoading ? '...' : formatCurrency(user.walletBalance)} />
        <StatsCard label="Participations" value={isLoading ? '...' : user.participations} />
        <StatsCard label="Wins" value={isLoading ? '...' : user.wins} />
        <StatsCard label="Today" value="Draw Day Ready" hint="Monday, Wednesday, Friday" />
      </div>

      <section className="card stack">
        <h2>Quick Actions</h2>
        <div className="row">
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('/wallet')}>
            Wallet
          </button>
          <button type="button" className="btn btn-soft" onClick={() => onNavigate('/daily-chances')}>
            Daily Chances
          </button>
          <button type="button" className="btn btn-soft" onClick={() => onNavigate('/notifications')}>
            Notifications ({notificationsUnreadCount})
          </button>
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => onNavigate('/testimonials')}
            disabled={!canOpenTestimonials}
          >
            Testimonials
          </button>
        </div>
      </section>

      {user.winnerNotice ? (
        <section className="card dashboard-winner-note">
          <strong>Winner Notice</strong>
          <p>{user.winnerNotice.message}</p>
          <p className="muted">
            Winning reference: {user.winnerNotice.referenceId}
            {user.winnerNotice.slotNumber ? ` | Draw Slot ${user.winnerNotice.slotNumber}` : ''}
          </p>
        </section>
      ) : null}

      {referralSummary.isActive ? (
      <section className="card stack">
        <div className="row spread">
          <h2>Referral Center</h2>
          <span className="status-pill">{referralAmountLabel}</span>
        </div>
        <div className="grid three">
          <StatsCard label="Total Referrals" value={referralSummary.totalReferrals} />
          <StatsCard label="Successful Referrals" value={referralSummary.successfulReferrals} />
          <StatsCard label="Referral Rewards" value={formatCurrency(referralSummary.totalRewardsEarned)} />
        </div>
        <div className="grid two">
          <section className="card">
            <p className="eyebrow">Referral Code</p>
            <h3>{referralSummary.referralCode}</h3>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => navigator.clipboard.writeText(referralSummary.referralCode)}
            >
              Copy referral code
            </button>
          </section>
          <section className="card">
            <p className="eyebrow">Referral Link</p>
            <p className="muted">{referralLink}</p>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => navigator.clipboard.writeText(referralLink)}
            >
              Copy referral link
            </button>
          </section>
        </div>
        <div className="stack">
          <h3>Recent Referral Activity</h3>
          {(referralSummary.recentActivity || []).length ? (
            referralSummary.recentActivity.map((activity) => (
              <div key={activity.id} className="entry-item">
                <strong>{activity.referenceId}</strong>
                <span>{activity.status === 'rewarded' ? 'Rewarded' : 'Pending qualification'}</span>
                <small>{formatActivityDate(activity.rewardedAt || activity.createdAt)}</small>
              </div>
            ))
          ) : (
            <p className="muted">Your referral activity will appear here after someone signs up with your code.</p>
          )}
        </div>
      </section>
      ) : null}

      <section className="card stack">
        <h2>Recent Entries</h2>
        <div className="entries-list">
          {isLoading
            ? Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="entry-item">
                  <div className="skeleton-line skeleton-line-title" />
                  <div className="skeleton-line skeleton-line-short" />
                  <div className="skeleton-line" />
                </div>
              ))
            : recentEntries.map((entry) => (
                <div key={entry.id} className="entry-item">
                  <strong>{entry.prizeTitle}</strong>
                  <span>{formatCurrency(entry.fee)}</span>
                  <small>{entry.date}</small>
                </div>
              ))}
        </div>
      </section>

      {testimonial ? (
        <section className="card stack">
          <div className="row spread">
            <h2>Your Testimonial</h2>
            <button type="button" className="btn btn-soft" onClick={() => onNavigate('/testimonials')}>
              Edit Testimonial
            </button>
          </div>
          <p className="eyebrow">{testimonial.prizeTitle}</p>
          <p>{testimonial.message}</p>
          <p className="muted">{testimonial.winningDate}</p>
        </section>
      ) : null}
    </section>
  )
}

export default Dashboard
