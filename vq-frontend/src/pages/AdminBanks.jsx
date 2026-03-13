import { useState } from 'react'

function AdminBanks({ banks, onAddBank, onUpdateBank, onRemoveBank }) {
  const [newBank, setNewBank] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
  })

  return (
    <section className="stack-lg">
      <header className="card">
        <h1>Bank Management</h1>
        <p className="muted">Add, edit, or remove bank accounts used in wallet funding instructions.</p>
      </header>
      <div className="grid two">
        {banks.map((bank) => (
          <article key={bank.id} className="card stack">
            <label>
              Bank Name
              <input
                type="text"
                value={bank.bankName}
                onChange={(event) => onUpdateBank(bank.id, 'bankName', event.target.value)}
              />
            </label>
            <label>
              Account Name
              <input
                type="text"
                value={bank.accountName}
                onChange={(event) => onUpdateBank(bank.id, 'accountName', event.target.value)}
              />
            </label>
            <label>
              Account Number
              <input
                type="text"
                value={bank.accountNumber}
                onChange={(event) => onUpdateBank(bank.id, 'accountNumber', event.target.value)}
              />
            </label>
            <button type="button" className="btn btn-soft" onClick={() => onRemoveBank(bank.id)}>
              Remove Bank
            </button>
          </article>
        ))}
      </div>
      <form
        className="card auth-card"
        onSubmit={(event) => {
          event.preventDefault()
          onAddBank(newBank)
          setNewBank({ bankName: '', accountName: '', accountNumber: '' })
        }}
      >
        <h3>Add Bank Account</h3>
        <label>
          Bank Name
          <input
            type="text"
            value={newBank.bankName}
            onChange={(event) => setNewBank((prev) => ({ ...prev, bankName: event.target.value }))}
          />
        </label>
        <label>
          Account Name
          <input
            type="text"
            value={newBank.accountName}
            onChange={(event) => setNewBank((prev) => ({ ...prev, accountName: event.target.value }))}
          />
        </label>
        <label>
          Account Number
          <input
            type="text"
            value={newBank.accountNumber}
            onChange={(event) => setNewBank((prev) => ({ ...prev, accountNumber: event.target.value }))}
          />
        </label>
        <button type="submit" className="btn btn-primary">
          Add Bank
        </button>
      </form>
    </section>
  )
}

export default AdminBanks
