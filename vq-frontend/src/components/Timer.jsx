import './Timer.css'

function Timer({ endTime, serverNow, status }) {
  const distance = Math.max(new Date(endTime).getTime() - serverNow, 0)
  const hours = Math.floor(distance / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)
  const label = `${hours}h ${minutes}m ${seconds}s`

  return <p className="timer">{status === 'closed' || status === 'filled' ? 'Entries closed' : `Draw closes in ${label}`}</p>
}

export default Timer
