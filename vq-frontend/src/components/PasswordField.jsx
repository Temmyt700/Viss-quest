import { useId, useState } from 'react'
import './PasswordField.css'

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  autoComplete,
  required = false,
}) {
  const [isVisible, setIsVisible] = useState(false)
  const inputId = useId()

  return (
    <label htmlFor={inputId}>
      {label}
      <div className="password-field-shell">
        <input
          id={inputId}
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          required={required}
          autoComplete={autoComplete}
          onChange={onChange}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setIsVisible((prev) => !prev)}
          aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={isVisible}
        >
          {isVisible ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6A2 2 0 0012 16a2 2 0 001.4-.6" />
              <path d="M9.9 5.1A10.8 10.8 0 0112 5c4.6 0 8.6 2.8 10 7a11.3 11.3 0 01-4 5.5" />
              <path d="M6.6 6.6A11.2 11.2 0 002 12a11.3 11.3 0 004.5 5.9" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </label>
  )
}

export default PasswordField
