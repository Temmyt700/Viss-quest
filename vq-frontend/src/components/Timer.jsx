import { useEffect, useMemo, useState } from 'react'
import './Timer.css'

function Timer({ endTime }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timerId = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timerId)
  }, [])

  const label = useMemo(() => {
    const distance = Math.max(new Date(endTime).getTime() - now, 0)
    const hours = Math.floor(distance / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)
    return `${hours}h ${minutes}m ${seconds}s`
  }, [endTime, now])

  return <p className="timer">Draw closes in {label}</p>
}

export default Timer
