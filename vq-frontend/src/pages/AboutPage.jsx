import TestimonialCard from '../components/TestimonialCard'
import './AboutPage.css'

function AboutPage({ testimonials, onViewTestimonialImages, onNavigate }) {
  const previewTestimonials = testimonials.slice(0, 3)

  return (
    <section className="about-page stack-lg">
      <header className="card about-hero">
        <div className="about-badges" aria-hidden="true">
          <span className="about-badge">About VissQuest</span>
          <span className="about-badge about-badge-soft">Built For Everyday Winners</span>
        </div>
        <h1>About VissQuest</h1>
        <p className="muted">
          VissQuest is a platform built to give everyday people a chance to win real rewards in a simple
          and exciting way. We believe that winning should not be complicated or reserved for a few.
        </p>
      </header>

      <section className="about-grid">
        <article className="card stack">
          <p className="eyebrow">Our Story</p>
          <h2>Powered by VISS GLOBAL RESOURCES</h2>
          <p className="muted">
            VissQuest is powered by VISS GLOBAL RESOURCES, a trusted brand that has served thousands of
            people over the years through various online platforms.
          </p>
          <p className="muted">
            With a strong community already built over time, we created VissQuest to bring fun, fairness,
            and real rewards to our audience.
          </p>
        </article>
        <article className="card stack">
          <p className="eyebrow">Our Mission</p>
          <h2>Fair, transparent, and simple</h2>
          <p className="muted">We want to create a fair and transparent platform that rewards real users with real prizes.</p>
          <p className="muted">Participation should stay simple, accessible, and exciting for everyone.</p>
        </article>
      </section>

      <section className="about-grid">
        <article className="card stack">
          <p className="eyebrow">How It Works</p>
          <ol className="about-list">
            <li>Fund your wallet</li>
            <li>Enter available draws</li>
            <li>Wait for the system to randomly select winners</li>
            <li>If you win, you get rewarded</li>
          </ol>
        </article>
        <article className="card stack">
          <p className="eyebrow">Our Promise</p>
          <ol className="about-list">
            <li>No hidden tricks</li>
            <li>No manipulation of results</li>
            <li>Winners are selected randomly</li>
            <li>Real users receive real rewards</li>
          </ol>
        </article>
      </section>

      <section className="card about-trust stack">
        <div className="section-head">
          <div>
            <p className="eyebrow">Why Trust VissQuest?</p>
            <h2>Built to reduce fear and reward trust</h2>
          </div>
        </div>
        <div className="about-trust-grid">
          <article className="about-trust-card">
            <h3>Existing Community</h3>
            <p className="muted">We are not new. We already have an active community of users who have engaged with our platforms for years.</p>
          </article>
          <article className="about-trust-card">
            <h3>Real Payments</h3>
            <p className="muted">We pay real winners. Real testimonials and proof-of-payment moments help show that clearly.</p>
            <button type="button" className="text-link" onClick={() => onNavigate('/testimonials')}>
              See real winners →
            </button>
          </article>
          <article className="about-trust-card">
            <h3>Transparent System</h3>
            <p className="muted">Winners are selected randomly. There is no manual manipulation. Every valid entry gets an equal chance.</p>
          </article>
          <article className="about-trust-card">
            <h3>Fast Support</h3>
            <p className="muted">Manual payment verification is handled quickly, and users are notified when important actions happen.</p>
          </article>
          <article className="about-trust-card">
            <h3>Verified Business</h3>
            <p className="muted">Payments are made to VISS GLOBAL RESOURCES so users know exactly who they are dealing with.</p>
          </article>
          <article className="about-trust-card">
            <h3>Responsible Platform</h3>
            <p className="muted">We encourage users to participate responsibly, spend only what they can afford, and enjoy the platform as entertainment.</p>
          </article>
        </div>
      </section>

      <section className="stack">
        <div className="section-head">
          <div>
            <p className="winners-section-kicker">Proof From Winners</p>
            <h2>Real user testimonials</h2>
          </div>
          <button type="button" className="btn btn-soft" onClick={() => onNavigate('/testimonials')}>
            View all testimonials
          </button>
        </div>
        <div className="grid three">
          {previewTestimonials.length ? (
            previewTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                onViewImages={onViewTestimonialImages}
              />
            ))
          ) : (
            <article className="card">
              <p className="muted">Testimonials will appear here as winners keep sharing their proof.</p>
            </article>
          )}
        </div>
      </section>

      <section className="card about-cta">
        <div>
          <p className="eyebrow">Ready to take a chance?</p>
          <h2>Start with your next lucky move</h2>
        </div>
        <div className="row">
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('/wallet')}>
            Fund Wallet
          </button>
          <button type="button" className="btn btn-soft" onClick={() => onNavigate('/')}>
            View Active Draws
          </button>
        </div>
      </section>
    </section>
  )
}

export default AboutPage
