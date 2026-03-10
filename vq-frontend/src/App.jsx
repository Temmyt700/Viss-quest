import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import AdminSidebar from './components/AdminSidebar'
import EntryModal from './components/EntryModal'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Wallet from './pages/Wallet'
import DailyChances from './pages/DailyChances'
import Winners from './pages/Winners'
import AdminDashboard from './pages/AdminDashboard'
import AdminCreateDraw from './pages/AdminCreateDraw'
import AdminParticipants from './pages/AdminParticipants'
import AdminDeposits from './pages/AdminDeposits'
import AdminWinners from './pages/AdminWinners'
import AdminQuiz from './pages/AdminQuiz'
import { DRAW_ITEMS, SPIN_REWARDS, WINNERS } from './data/mockData'
import './App.css'

function App() {
  const spinTimeoutRef = useRef(null)
  const [path, setPath] = useState(window.location.pathname || '/')
  const [walletBalance, setWalletBalance] = useState(1200)
  const [entryDraw, setEntryDraw] = useState(null)
  const [entryCelebration, setEntryCelebration] = useState(null)
  const [recentEntries, setRecentEntries] = useState([
    {
      id: 'e1',
      prizeTitle: 'Cash Prize Draw',
      fee: 500,
      date: 'March 10, 2026',
    },
  ])
  const [transactions, setTransactions] = useState([
    {
      id: 't1',
      date: 'Mar 10, 2026',
      type: 'Deposit',
      amount: 5000,
      status: 'Approved',
    },
    {
      id: 't2',
      date: 'Mar 10, 2026',
      type: 'Entry Fee',
      amount: -500,
      status: 'Completed',
    },
  ])
  const [spinState, setSpinState] = useState({
    hasSpunToday: false,
    isSpinning: false,
    rotation: 0,
    result: null,
    showResultModal: false,
  })
  const [quizState, setQuizState] = useState({
    answered: false,
    isCorrect: false,
    reward: 0,
  })

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname || '/')
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      if (spinTimeoutRef.current) {
        window.clearTimeout(spinTimeoutRef.current)
      }
    }
  }, [])

  const navigate = (nextPath) => {
    if (nextPath === path) return
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  const handleEnterDraw = (draw) => setEntryDraw(draw)

  const handleConfirmEntry = () => {
    if (!entryDraw || walletBalance < entryDraw.entryFee) return

    const confirmedDraw = entryDraw

    setWalletBalance((prev) => prev - entryDraw.entryFee)
    setRecentEntries((prev) => [
      {
        id: `e${Date.now()}`,
        prizeTitle: entryDraw.title,
        fee: entryDraw.entryFee,
        date: 'March 10, 2026',
      },
      ...prev,
    ])
    setTransactions((prev) => [
      {
        id: `t${Date.now()}`,
        date: 'Mar 10, 2026',
        type: 'Entry Fee',
        amount: -entryDraw.entryFee,
        status: 'Completed',
      },
      ...prev,
    ])
    setEntryCelebration({
      title: confirmedDraw.title,
      fee: confirmedDraw.entryFee,
    })
    setEntryDraw(null)
  }

  const handleSpin = () => {
    if (spinState.hasSpunToday || spinState.isSpinning || walletBalance < 15) return

    const rewardIndex = Math.floor(Math.random() * SPIN_REWARDS.length)
    const reward = SPIN_REWARDS[rewardIndex]
    const segmentAngle = 360 / SPIN_REWARDS.length
    const targetAngle = 360 - rewardIndex * segmentAngle
    const fullTurns = 5 * 360
    const nextRotation = spinState.rotation + fullTurns + targetAngle

    setSpinState((prev) => ({
      ...prev,
      isSpinning: true,
      rotation: nextRotation,
      result: null,
      showResultModal: false,
    }))

    spinTimeoutRef.current = window.setTimeout(() => {
      const rewardValue = reward.type === 'cash' ? reward.amount : 0
      const netAmount = rewardValue - 15

      setWalletBalance((prev) => prev + netAmount)
      setSpinState({
        hasSpunToday: true,
        isSpinning: false,
        rotation: nextRotation,
        result: reward,
        showResultModal: true,
      })
      setTransactions((prev) => [
        {
          id: `t${Date.now()}-spin`,
          date: 'Mar 10, 2026',
          type: 'Spin',
          amount: netAmount,
          status: 'Completed',
        },
        ...prev,
      ])
      spinTimeoutRef.current = null
    }, 2200)
  }

  const handleQuizAnswer = (isCorrect, rewardAmount) => {
    if (quizState.answered) return

    if (isCorrect) {
      setWalletBalance((prev) => prev + rewardAmount)
      setTransactions((prev) => [
        {
          id: `t${Date.now()}-quiz`,
          date: 'Mar 10, 2026',
          type: 'Quiz Reward',
          amount: rewardAmount,
          status: 'Completed',
        },
        ...prev,
      ])
    }

    setQuizState({
      answered: true,
      isCorrect,
      reward: isCorrect ? rewardAmount : 0,
    })
  }

  const sharedUser = useMemo(
    () => ({
      fullName: 'Ada Obi',
      referenceId: 'VQ024',
      walletBalance,
      participations: recentEntries.length,
      wins: 1,
    }),
    [walletBalance, recentEntries.length]
  )

  const adminRows = useMemo(
    () => ({
      participants: [
        { referenceId: 'VQ024', draw: 'Laptop Draw', status: 'Entered' },
        { referenceId: 'VQ112', draw: 'Cash Prize Draw', status: 'Entered' },
      ],
      deposits: [
        { referenceId: 'VQ024', amount: 'N 10,000', status: 'Pending' },
        { referenceId: 'VQ088', amount: 'N 5,000', status: 'Approved' },
      ],
      winners: WINNERS.map((winner) => ({
        referenceId: winner.referenceId,
        prize: winner.prizeTitle,
        date: winner.date,
      })),
    }),
    []
  )

  const renderPage = () => {
    switch (path) {
      case '/':
        return (
          <Home
            draws={DRAW_ITEMS}
            onEnterDraw={handleEnterDraw}
            celebration={entryCelebration}
            onDismissCelebration={() => setEntryCelebration(null)}
          />
        )
      case '/login':
        return <Login onGoSignup={() => navigate('/signup')} />
      case '/signup':
        return <Signup onGoLogin={() => navigate('/login')} />
      case '/dashboard':
        return (
          <Dashboard
            user={sharedUser}
            recentEntries={recentEntries}
            onNavigate={navigate}
          />
        )
      case '/wallet':
        return (
          <Wallet
            user={sharedUser}
            transactions={transactions}
            onFundWallet={() => navigate('/wallet')}
          />
        )
      case '/daily-chances':
        return (
          <DailyChances
            rewards={SPIN_REWARDS}
            spinState={spinState}
            walletBalance={walletBalance}
            onSpin={handleSpin}
            onCloseResultModal={() =>
              setSpinState((prev) => ({
                ...prev,
                showResultModal: false,
              }))
            }
            quizState={quizState}
            onSubmitAnswer={handleQuizAnswer}
          />
        )
      case '/winners':
        return <Winners winners={WINNERS} />
      case '/admin':
        return (
          <AdminDashboard
            stats={{
              draws: 3,
              pendingDeposits: 6,
              todaysQuiz: 'Published',
            }}
            participants={adminRows.participants}
          />
        )
      case '/admin/create-draw':
        return <AdminCreateDraw />
      case '/admin/participants':
        return <AdminParticipants participants={adminRows.participants} />
      case '/admin/deposits':
        return <AdminDeposits deposits={adminRows.deposits} />
      case '/admin/winners':
        return <AdminWinners winners={adminRows.winners} />
      case '/admin/quiz':
        return <AdminQuiz />
      default:
        return (
          <Home
            draws={DRAW_ITEMS}
            onEnterDraw={handleEnterDraw}
            celebration={entryCelebration}
            onDismissCelebration={() => setEntryCelebration(null)}
          />
        )
    }
  }

  const isAdminRoute = path === '/admin' || path.startsWith('/admin/')

  return (
    <div className="app-shell">
      <Navbar currentPath={path} onNavigate={navigate} />
      <main className="page-container">
        {isAdminRoute ? (
          <div className="admin-layout">
            <AdminSidebar currentPath={path} onNavigate={navigate} />
            <section className="admin-content">{renderPage()}</section>
          </div>
        ) : (
          renderPage()
        )}
      </main>
      <EntryModal
        draw={entryDraw}
        walletBalance={walletBalance}
        onClose={() => setEntryDraw(null)}
        onConfirm={handleConfirmEntry}
        onFundWallet={() => navigate('/wallet')}
      />
    </div>
  )
}

export default App
