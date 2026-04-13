import { SUPPORT_CONTACT } from '../utils/constants'
import './LegalPage.css'

const content = {
  terms: {
    eyebrow: 'Terms & Conditions',
    title: 'VissQuest Terms and Conditions',
    intro:
      'VissQuest is a digital platform operated under VISS GLOBAL RESOURCES. By using this platform, you agree to the terms below.',
    sections: [
      {
        heading: '1. Introduction',
        points: [
          'VissQuest is a digital platform operated under VISS GLOBAL RESOURCES.',
          'By accessing or using VissQuest, you agree to be bound by these Terms and Conditions.',
        ],
      },
      {
        heading: '2. Nature of Service',
        points: [
          'VissQuest provides games of chance including draws and spins.',
          'Participation does not guarantee winning.',
          'Winners are selected randomly by the system.',
        ],
      },
      {
        heading: '3. Eligibility',
        points: [
          'Users must be at least 18 years old to participate.',
          'Users must provide accurate and complete personal information.',
        ],
      },
      {
        heading: '4. User Responsibility',
        points: [
          'Only use funds you can afford to lose.',
          'Users are responsible for all activity carried out on their account.',
          'Users must not attempt to exploit, manipulate, or abuse the platform.',
        ],
      },
      {
        heading: '5. Payments',
        points: [
          'All wallet funding is final and non-refundable once approved.',
          'Users must follow funding instructions correctly.',
          'Incorrect transfers remain the responsibility of the user.',
        ],
      },
      {
        heading: '6. Winnings',
        points: [
          'Winners are selected randomly.',
          'All winnings remain subject to verification.',
          'Admin reserves the right to review suspicious activity before payout or confirmation.',
        ],
      },
      {
        heading: '7. Account Restrictions',
        points: [
          'We reserve the right to suspend accounts.',
          'We may block fraudulent users.',
          'We may reverse rewards if abuse or fraud is detected.',
        ],
      },
      {
        heading: '8. Limitation of Liability',
        points: [
          'VissQuest is not liable for losses incurred through participation.',
          'VissQuest is not liable for network, payment, or technical issues.',
          'VissQuest is not liable for third-party failures outside our direct control.',
        ],
      },
      {
        heading: '9. Modifications',
        points: ['We may update these terms at any time. Continued use of the platform means you accept the updated terms.'],
      },
      {
        heading: '10. Responsible Participation',
        points: [
          'Do not rely on this platform as a source of income.',
          'Participation is provided for entertainment purposes only.',
        ],
      },
    ],
  },
  privacy: {
    eyebrow: 'Privacy Policy',
    title: 'VissQuest Privacy Policy',
    intro:
      'VissQuest is operated under VISS GLOBAL RESOURCES. We are committed to protecting your personal information and privacy.',
    sections: [
      {
        heading: '1. Introduction',
        points: [
          'By using this platform, you agree to the terms of this Privacy Policy.',
        ],
      },
      {
        heading: '2. Information We Collect',
        points: [
          'Full name',
          'Email address',
          'Phone number',
          'Transaction data including wallet funding, entries, and winnings',
          'Device and browser data for analytics and security',
        ],
      },
      {
        heading: '3. How We Use Your Information',
        points: [
          'To create and manage your account',
          'To process wallet funding and transactions',
          'To notify you of account activity',
          'To send important emails such as verification and winner notifications',
          'To improve platform performance and security',
        ],
      },
      {
        heading: '4. Data Protection',
        points: [
          'We implement reasonable security measures to protect your data.',
          'No system is 100% secure, so we cannot guarantee absolute protection.',
        ],
      },
      {
        heading: '5. Sharing of Information',
        points: [
          'We do not sell or rent your personal data.',
          'We may share data only when necessary with service providers such as email services like ZeptoMail.',
          'We may share data with legal authorities where required by law.',
        ],
      },
      {
        heading: '6. Cookies & Tracking',
        points: [
          'We may use cookies to improve user experience, remember login sessions, and analyze traffic patterns.',
          'Users can disable cookies in their browser settings, although some features may work less smoothly.',
        ],
      },
      {
        heading: '7. User Rights',
        points: [
          'You may request access to your data.',
          'You may request corrections.',
          'You may request account deletion.',
        ],
      },
      {
        heading: '8. Data Retention',
        points: ['We retain user data only for as long as necessary to support platform operations, compliance, and support needs.'],
      },
      {
        heading: '9. Policy Updates',
        points: ['We may update this Privacy Policy at any time. Continued use of the platform means acceptance of updates.'],
      },
      {
        heading: '10. Contact',
        points: [`For privacy-related concerns, contact ${SUPPORT_CONTACT.email}.`],
      },
    ],
  },
  disclaimer: {
    eyebrow: 'Disclaimer',
    title: 'VissQuest Disclaimer',
    intro:
      'VissQuest is a digital platform that offers games of chance for entertainment purposes only.',
    sections: [
      {
        heading: '1. General Disclaimer',
        points: ['Participation is voluntary and should be approached responsibly.'],
      },
      {
        heading: '2. No Guarantee of Winning',
        points: [
          'Participation does not guarantee winning.',
          'Outcomes are randomly generated.',
          'Results are based purely on chance.',
        ],
      },
      {
        heading: '3. Financial Disclaimer',
        points: [
          'Users should only participate with money they can afford to lose.',
          'VissQuest is not an investment platform.',
          'Do not rely on winnings as a source of income.',
        ],
      },
      {
        heading: '4. Responsible Participation',
        points: ['Play responsibly.', 'Avoid excessive spending.', 'Take breaks when needed.'],
      },
      {
        heading: '5. Limitation of Liability',
        points: [
          'VissQuest is not responsible for financial losses from participation.',
          'VissQuest is not responsible for network or technical issues.',
          'VissQuest is not responsible for delays in payment processing.',
          'VissQuest is not responsible for user mistakes during transactions.',
        ],
      },
      {
        heading: '6. Platform Rights',
        points: [
          'We reserve the right to suspend accounts.',
          'We reserve the right to investigate suspicious activity.',
          'We reserve the right to reverse rewards obtained fraudulently.',
        ],
      },
      {
        heading: '7. External Services',
        points: [
          'We are not responsible for failures from banking systems.',
          'We are not responsible for failures from third-party services.',
          'We are not responsible for failures from email delivery systems.',
        ],
      },
      {
        heading: '8. Acceptance',
        points: ['By using VissQuest, you agree to this disclaimer.'],
      },
    ],
  },
}

function LegalPage({ variant = 'terms' }) {
  const section = content[variant] || content.terms

  return (
    <section className="legal-page stack-lg">
      <header className="card legal-hero">
        <p className="eyebrow">{section.eyebrow}</p>
        <h1>{section.title}</h1>
        <p className="muted">{section.intro}</p>
      </header>
      <div className="legal-sections">
        {section.sections.map((item) => (
          <section key={item.heading} className="card legal-section">
            <h2>{item.heading}</h2>
            <div className="stack">
              {item.points.map((point) => (
                <p key={point} className="muted">
                  {point}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

export default LegalPage
