import { useEffect, useState } from 'react'
import { formatCurrency } from '../utils/format'
import { APPROVED_FUNDING_AMOUNTS } from '../utils/constants'
import './WalletFundingModal.css'

function WalletFundingModal({ isOpen, user, banks, supportContact, onClose, onSubmit }) {
  const [selectedAmount, setSelectedAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionComplete, setSubmissionComplete] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setSelectedAmount('')
      setIsSubmitting(false)
      setSubmissionComplete(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const hasAmount = selectedAmount !== ''

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card funding-modal">
        <div className="row spread">
          <h3>Fund Wallet</h3>
          <button type="button" className="btn btn-soft" onClick={onClose}>
            Close
          </button>
        </div>
        {submissionComplete ? (
          <section className="funding-instructions card stack">
            <p className="result-success">Payment submitted successfully</p>
            <p className="muted">
              Your payment has been submitted and is being confirmed. Once it is approved, it will
              reflect in your wallet balance.
            </p>
            <p className="muted">
              You will also receive a notification when the payment has been approved and added to
              your wallet.
            </p>
            <p className="muted support-copy">
              If your wallet balance does not update within 24 hours, please send a screenshot of
              your payment to our WhatsApp number: {supportContact.whatsapp} or our support email:
              {' '}{supportContact.email}.
            </p>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Back to wallet
            </button>
          </section>
        ) : (
          <>
            <label>
              Select Amount to Fund
              <select value={selectedAmount} onChange={(event) => setSelectedAmount(event.target.value)}>
                <option value="">Choose approved amount</option>
                {APPROVED_FUNDING_AMOUNTS.map((amount) => (
                  <option key={amount} value={amount}>
                    {formatCurrency(amount)}
                  </option>
                ))}
              </select>
            </label>

            {hasAmount ? (
              <section className="funding-instructions card">
                <div className="bank-list">
                  {banks.map((bank) => (
                    <div key={bank.id} className="bank-card">
                      <p className="eyebrow">Bank Name</p>
                      <strong>{bank.bankName}</strong>
                      <p className="eyebrow">Account Number</p>
                      <strong>{bank.accountNumber}</strong>
                      <p className="eyebrow">Account Name</p>
                      <strong>{bank.accountName}</strong>
                    </div>
                  ))}
                </div>
                <div className="grid two">
                  <div>
                    <p className="eyebrow">Selected Amount</p>
                    <strong>{formatCurrency(Number(selectedAmount))}</strong>
                  </div>
                  <div>
                    <p className="eyebrow">Reference ID</p>
                    <strong>{user.referenceId}</strong>
                  </div>
                </div>

                <p className="funding-note">
                  Transfer the exact selected amount and include your Reference ID in the narration.
                </p>
                <div className="funding-loader">
                  <span className="loader-dot" />
                  <p>When you have completed the transfer, click the button below.</p>
                </div>
                <div className="warning-box">
                  <strong>WARNING:</strong> Do NOT click this button unless you have already sent the
                  payment. False confirmations may lead to permanent account suspension.
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true)
                    try {
                      await onSubmit(Number(selectedAmount))
                      setSubmissionComplete(true)
                    } catch (_error) {
                      // Parent state already surfaces a user-friendly error banner.
                    } finally {
                      setIsSubmitting(false)
                    }
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'I have sent the money'}
                </button>
                <p className="muted support-copy">
                  If your wallet balance does not update within 24 hours, please send a screenshot of
                  your payment to our WhatsApp number: {supportContact.whatsapp} or our support email:
                  {' '}{supportContact.email}.
                </p>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default WalletFundingModal
