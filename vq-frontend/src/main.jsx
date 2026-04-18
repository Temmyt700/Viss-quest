import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

let didReloadForSwUpdate = false

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      const activateWaitingWorker = () => {
        if (!registration.waiting) return
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }

      if (registration.waiting) {
        activateWaitingWorker()
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            activateWaitingWorker()
          }
        })
      })

      // Check for new SW in the background so installed PWAs pick up releases
      // quickly even if users keep the app open for long sessions.
      const safeUpdateCheck = () => {
        registration.update().catch(() => {})
      }

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          safeUpdateCheck()
        }
      })

      window.setInterval(safeUpdateCheck, 60 * 1000)
    }).catch(() => {})

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload once per page lifecycle when a new worker takes control.
      if (didReloadForSwUpdate) return
      didReloadForSwUpdate = true
      window.location.reload()
    })
  })
}

createRoot(document.getElementById('root')).render(<App />)
