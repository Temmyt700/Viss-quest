const content = {
  terms: {
    intro: 'By using VissQuest, you agree to the prize-draw participation rules and wallet funding terms below.',
    items: [
      'All draw entries are final once your wallet is charged.',
      'Winners are selected randomly by the system from valid entries only.',
      'Wallet funding requests are subject to manual confirmation before balance updates.',
    ],
  },
  privacy: {
    intro: 'VissQuest uses your account details to manage your wallet, entries, notifications, and prize communication.',
    items: [
      'Public winner views use your reference ID instead of personal identity details.',
      'Payment and account data are used only for platform operations and support.',
      'We retain notifications, wallet records, and draw activity for audit and support purposes.',
    ],
  },
  rules: {
    intro: 'These platform rules help keep draws fair, transparent, and manageable for every user.',
    items: [
      'Only participate with amounts you can afford to lose.',
      'A single draw can close early if its timer expires or its entry capacity is filled.',
      'Daily games have usage limits and can only be used when your account is eligible.',
    ],
  },
}

function LegalPage({ title, variant }) {
  const section = content[variant] || content.rules

  return (
    <section className="stack-lg">
      <header className="card">
        <p className="eyebrow">VissQuest Policies</p>
        <h1>{title}</h1>
        <p className="muted">{section.intro}</p>
      </header>
      <section className="card stack">
        {section.items.map((item) => (
          <p key={item} className="muted">
            {item}
          </p>
        ))}
      </section>
    </section>
  )
}

export default LegalPage
