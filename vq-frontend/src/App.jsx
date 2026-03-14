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
import Notifications from './pages/Notifications'
import Testimonials from './pages/Testimonials'
import AdminDashboard from './pages/AdminDashboard'
import AdminBanks from './pages/AdminBanks'
import AdminCreateDraw from './pages/AdminCreateDraw'
import AdminParticipants from './pages/AdminParticipants'
import AdminDeposits from './pages/AdminDeposits'
import AdminWalletStats from './pages/AdminWalletStats'
import AdminWinners from './pages/AdminWinners'
import AdminQuiz from './pages/AdminQuiz'
import AdminUsers from './pages/AdminUsers'
import AdminUserDetail from './pages/AdminUserDetail'
import {
  DRAW_ITEMS,
  BANK_ACCOUNTS,
  INITIAL_DEPOSITS,
  NOTIFICATIONS,
  QUIZ_SCHEDULE,
  SPIN_REWARDS,
  TESTIMONIALS,
  USER_HISTORY,
  USERS,
  WALLET_STATS,
  WINNERS,
  SUPPORT_CONTACT,
} from './data/mockData'
import { getAutomatedStatus, isDrawEntryOpen } from './utils/draws'
import './App.css'

function App() {
  const spinTimeoutRef = useRef(null)
  const [path, setPath] = useState(window.location.pathname || '/')
  const [serverNow, setServerNow] = useState(new Date('2026-03-13T12:00:00').getTime())
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [draws, setDraws] = useState(DRAW_ITEMS)
  const [walletBalance, setWalletBalance] = useState(1200)
  const [isFundingOpen, setIsFundingOpen] = useState(false)
  const [entryDraw, setEntryDraw] = useState(null)
  const [entryCelebration, setEntryCelebration] = useState(null)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [testimonials, setTestimonials] = useState(TESTIMONIALS)
  const [depositRequests, setDepositRequests] = useState(INITIAL_DEPOSITS)
  const [bankAccounts, setBankAccounts] = useState(BANK_ACCOUNTS)
  const [users, setUsers] = useState(USERS)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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
    const serverTimerId = window.setInterval(() => {
      setServerNow((prev) => prev + 1000)
    }, 1000)
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      window.clearInterval(serverTimerId)
      if (spinTimeoutRef.current) {
        window.clearTimeout(spinTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setDraws((prev) =>
      prev.map((draw) => {
        const nextStatus =
          draw.manualStatus ||
          getAutomatedStatus(draw.currentEntries, draw.maxEntries, draw.endTime, serverNow)
        return nextStatus === draw.status ? draw : { ...draw, status: nextStatus }
      })
    )
  }, [serverNow])

  useEffect(() => {
    if (!entryDraw) return
    const latestDraw = draws.find((draw) => draw.id === entryDraw.id)
    if (latestDraw && latestDraw !== entryDraw) {
      setEntryDraw(latestDraw)
    }
  }, [draws, entryDraw])

  const navigate = (nextPath) => {
    if (nextPath === path) return
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
    setIsNotificationsOpen(false)
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setIsNotificationsOpen(false)
    setIsFundingOpen(false)
    setEntryDraw(null)
    setPath('/')
    window.history.pushState({}, '', '/')
  }

  const handleEnterDraw = (draw) => {
    if (!isDrawEntryOpen(draw.status)) return
    setEntryDraw(draw)
  }

  const handleConfirmEntry = () => {
    if (!entryDraw || walletBalance < entryDraw.entryFee) return

    const confirmedDraw = draws.find((draw) => draw.id === entryDraw.id)
    if (!confirmedDraw || !isDrawEntryOpen(confirmedDraw.status)) return

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
    setDraws((prev) =>
      prev.map((draw) => {
        if (draw.id !== confirmedDraw.id) return draw
        const currentEntries = draw.currentEntries + 1
        const status =
          draw.manualStatus ||
          getAutomatedStatus(currentEntries, draw.maxEntries, draw.endTime, serverNow)
        return { ...draw, currentEntries, status }
      })
    )
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
      setNotifications((prev) => [
        {
          id: `n-spin-${Date.now()}`,
          title: 'Daily spin complete',
          message: `Your spin reward is ${reward.label}.`,
          timestamp: 'Just now',
        },
        ...prev,
      ])
      spinTimeoutRef.current = null
    }, 6000)
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

  const handleSubmitFunding = (amount, proofName) => {
    const request = {
      id: `dep-${Date.now()}`,
      userId: 'u1',
      referenceId: 'VQ024',
      amount,
      proofName,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      status: 'Pending',
    }

    setDepositRequests((prev) => [request, ...prev])
    setTransactions((prev) => [
      {
        id: `txn-pending-${Date.now()}`,
        date: 'Mar 12, 2026',
        type: 'Deposit Request',
        amount,
        status: 'Pending',
      },
      ...prev,
    ])
    setNotifications((prev) => [
      {
        id: `n-deposit-${Date.now()}`,
        title: 'Wallet funding request submitted',
        message: `Your ${amount.toLocaleString()} funding request is awaiting approval.`,
        timestamp: 'Just now',
      },
      ...prev,
    ])
    setIsFundingOpen(false)
  }

  const handleApproveDeposit = (depositId) => {
    const deposit = depositRequests.find((item) => item.id === depositId)
    if (!deposit) return

    setDepositRequests((prev) =>
      prev.map((item) => (item.id === depositId ? { ...item, status: 'Approved' } : item))
    )

    if (deposit.referenceId === 'VQ024') {
      setWalletBalance((prev) => prev + deposit.amount)
      setTransactions((prev) => [
        {
          id: `txn-approved-${Date.now()}`,
          date: 'Mar 12, 2026',
          type: 'Deposit',
          amount: deposit.amount,
          status: 'Approved',
        },
        ...prev,
      ])
    }

    setNotifications((prev) => [
      {
        id: `n-approved-${Date.now()}`,
        title: 'Wallet deposit approved',
        message: `${deposit.referenceId} deposit of N ${deposit.amount.toLocaleString()} has been approved.`,
        timestamp: 'Just now',
      },
      ...prev,
    ])
  }

  const handleRejectDeposit = (depositId) => {
    setDepositRequests((prev) =>
      prev.map((item) => (item.id === depositId ? { ...item, status: 'Rejected' } : item))
    )
  }

  const handleDrawStatusOverride = (drawId, nextStatus) => {
    setDraws((prev) =>
      prev.map((draw) => {
        if (draw.id !== drawId) return draw
        return {
          ...draw,
          manualStatus: nextStatus === 'auto' ? '' : nextStatus,
          status:
            nextStatus === 'auto'
              ? getAutomatedStatus(draw.currentEntries, draw.maxEntries, draw.endTime, serverNow)
              : nextStatus,
        }
      })
    )
  }

  const handleCloseDraw = (drawId) => {
    setDraws((prev) =>
      prev.map((draw) =>
        draw.id === drawId ? { ...draw, manualStatus: 'filled', status: 'filled' } : draw
      )
    )
  }

  const handleBanToggle = (userId) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              accountStatus: user.accountStatus === 'Suspended' ? 'Active' : 'Suspended',
            }
          : user
      )
    )
  }

  const handleRoleChange = (userId, role) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, role } : user))
    )
  }

  const handleAddBank = (bank) => {
    if (!bank.bankName || !bank.accountName || !bank.accountNumber) return
    setBankAccounts((prev) => [
      ...prev,
      {
        id: `bank-${Date.now()}`,
        ...bank,
      },
    ])
  }

  const handleUpdateBank = (bankId, field, value) => {
    setBankAccounts((prev) =>
      prev.map((bank) => (bank.id === bankId ? { ...bank, [field]: value } : bank))
    )
  }

  const handleRemoveBank = (bankId) => {
    setBankAccounts((prev) => prev.filter((bank) => bank.id !== bankId))
  }

  const handleSubmitTestimonial = ({ winningDate, message }) => {
    setTestimonials((prev) => [
      {
        id: `tm-${Date.now()}`,
        userId: 'u1',
        referenceId: 'VQ024',
        prizeTitle: 'Laptop Draw',
        winningDate,
        message,
        images: [
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
        ],
      },
      ...prev,
    ])
  }

  const sharedUser = useMemo(
    () => ({
      fullName: 'Ada Obi',
      referenceId: 'VQ024',
      walletBalance,
      participations: recentEntries.length,
      wins: 1,
      userId: 'u1',
    }),
    [walletBalance, recentEntries.length]
  )

  const adminRows = useMemo(
    () => ({
      participants: recentEntries.map((entry, index) => ({
        referenceId: index % 2 === 0 ? 'VQ024' : 'VQ112',
        draw: entry.prizeTitle,
        status: 'Entered',
      })),
      deposits: [...depositRequests],
      winners: WINNERS.map((winner) => ({
        referenceId: winner.referenceId,
        prize: winner.prizeTitle,
        date: winner.date,
      })),
      users,
      draws,
    }),
    [depositRequests, draws, recentEntries, users]
  )

  const renderPage = () => {
    const selectedUserId = path.startsWith('/admin/users/') ? path.split('/').pop() : null
    const selectedUser = users.find((user) => user.id === selectedUserId)

    switch (path) {
      case '/':
        return (
          <Home
            draws={draws}
            serverNow={serverNow}
            onEnterDraw={handleEnterDraw}
            celebration={entryCelebration}
            onDismissCelebration={() => setEntryCelebration(null)}
          />
        )
      case '/login':
        return <Login onGoSignup={() => navigate('/signup')} onLogin={handleLogin} />
      case '/signup':
        return <Signup onGoLogin={() => navigate('/login')} onSignup={handleLogin} />
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
            isFundingOpen={isFundingOpen}
            banks={bankAccounts}
            supportContact={SUPPORT_CONTACT}
            onFundWallet={() => setIsFundingOpen(true)}
            onCloseFunding={() => setIsFundingOpen(false)}
            onSubmitFunding={handleSubmitFunding}
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
        return <Winners winners={WINNERS} testimonials={testimonials} />
      case '/notifications':
        return <Notifications notifications={notifications} />
      case '/testimonials':
        return (
          <Testimonials
            testimonials={testimonials}
            canSubmit={sharedUser.wins > 0}
            onSubmitTestimonial={handleSubmitTestimonial}
          />
        )
      case '/admin':
        return (
          <AdminDashboard
            stats={{
              draws: draws.filter((draw) => !['closed', 'completed'].includes(draw.status)).length,
              pendingDeposits: depositRequests.filter((item) => item.status === 'Pending').length,
              todaysQuiz: 'Published',
              totalUsers: users.length,
            }}
            participants={adminRows.participants}
            draws={adminRows.draws}
            serverNow={serverNow}
            onStatusChange={handleDrawStatusOverride}
            onCloseDraw={handleCloseDraw}
          />
        )
      case '/admin/create-draw':
        return <AdminCreateDraw />
      case '/admin/participants':
        return <AdminParticipants participants={adminRows.participants} />
      case '/admin/deposits':
        return (
          <AdminDeposits
            deposits={adminRows.deposits}
            onApprove={handleApproveDeposit}
            onReject={handleRejectDeposit}
          />
        )
      case '/admin/wallet-stats':
        return <AdminWalletStats stats={WALLET_STATS} transactions={transactions} />
      case '/admin/banks':
        return (
          <AdminBanks
            banks={bankAccounts}
            onAddBank={handleAddBank}
            onUpdateBank={handleUpdateBank}
            onRemoveBank={handleRemoveBank}
          />
        )
      case '/admin/winners':
        return <AdminWinners winners={adminRows.winners} />
      case '/admin/quiz':
        return <AdminQuiz scheduledQuizzes={QUIZ_SCHEDULE} />
      case '/admin/users':
        return (
          <AdminUsers
            users={adminRows.users}
            onViewUser={(userId) => navigate(`/admin/users/${userId}`)}
            onBanToggle={handleBanToggle}
            onRoleChange={handleRoleChange}
          />
        )
      case `/admin/users/${selectedUserId}`:
        return (
          <AdminUserDetail
            user={selectedUser}
            history={USER_HISTORY[selectedUserId]}
            onBanToggle={handleBanToggle}
            onRoleChange={handleRoleChange}
          />
        )
      default:
        if (path.startsWith('/admin/users/')) {
          return (
            <AdminUserDetail
              user={selectedUser}
              history={USER_HISTORY[selectedUserId]}
              onBanToggle={handleBanToggle}
              onRoleChange={handleRoleChange}
            />
          )
        }
        return <Home draws={draws} serverNow={serverNow} onEnterDraw={handleEnterDraw} celebration={entryCelebration} onDismissCelebration={() => setEntryCelebration(null)} />
    }
  }

  const isAdminRoute = path === '/admin' || path.startsWith('/admin/')

  return (
    <div className="app-shell">
      <Navbar
        currentPath={path}
        onNavigate={navigate}
        notifications={notifications}
        isNotificationsOpen={isNotificationsOpen}
        onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
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
