import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import AdminSidebar from './components/AdminSidebar'
import EntryModal from './components/EntryModal'
import DrawDetailsModal from './components/DrawDetailsModal'
import InfoModal from './components/InfoModal'
import InstallPromptModal from './components/InstallPromptModal'
import SiteFooter from './components/SiteFooter'
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
import AdminSpinSettings from './pages/AdminSpinSettings'
import AdminUsers from './pages/AdminUsers'
import AdminUserDetail from './pages/AdminUserDetail'
import AdminNotifications from './pages/AdminNotifications'
import LegalPage from './pages/LegalPage'
import { apiRequest } from './utils/api'
import { SUPPORT_CONTACT } from './utils/constants'
import {
  flattenDraws,
  formatDisplayDate,
  formatDisplayDay,
  mapBanks,
  mapNotifications,
  mapSpinSettings,
  mapTestimonials,
  mapTransactions,
  mapWinners,
} from './utils/mappers'
import { isDrawEntryOpen } from './utils/draws'
import './App.css'

const emptyDashboard = {
  user: null,
  wallet: null,
  participations: 0,
  wins: 0,
  recentEntries: [],
  latestNotifications: [],
  winnerNotice: null,
  referralSummary: null,
}

const emptyWalletStats = {
  totalWalletBalance: 0,
  totalDeposits: 0,
  totalSpentOnEntries: 0,
  totalSpentOnSpins: 0,
  totalRewardsPaid: 0,
  transactions: [],
}

const emptySpinState = {
  hasSpunToday: false,
  isSpinning: false,
  isPriming: false,
  rotation: 0,
  result: null,
  showResultModal: false,
}

const emptyQuizState = {
  answered: false,
  isCorrect: false,
  reward: 0,
}

const protectedUserPaths = ['/dashboard', '/wallet', '/daily-chances', '/notifications', '/testimonials']

// The current product only exposes two practical roles in the UI.
const normalizeRole = (role) => (role === 'admin' ? 'admin' : 'user')

const normalizeUserRow = (user) => ({
  id: user.id,
  fullName: user.name || user.fullName || 'Unknown User',
  referenceId: user.referenceId || 'PENDING_REF',
  email: user.email,
  phone: user.phone || '',
  walletBalance: Number(user.walletBalance || 0),
  accountStatus: user.status ? user.status[0].toUpperCase() + user.status.slice(1) : user.accountStatus || 'Active',
  role: normalizeRole(user.role),
})

const normalizeParticipantRow = (participant) => ({
  id: participant.id,
  referenceId: participant.referenceId,
  draw: participant.draw,
  status: participant.status,
})

const normalizeQuizRow = (quiz) => ({
  id: quiz.id,
  question: quiz.question,
  optionA: quiz.optionA,
  optionB: quiz.optionB,
  optionC: quiz.optionC,
  optionD: quiz.optionD,
  correctAnswer: quiz.correctAnswer,
  goLiveMode: quiz.goLiveMode,
  scheduledAt: quiz.scheduledAt || quiz.activeFrom,
  status: quiz.status,
  rewardAmount: Number(quiz.rewardAmount || 0),
  scheduledTime: formatDisplayDate(quiz.scheduledAt || quiz.activeFrom, 'Instant'),
  activeWindow: '24 hours',
})

function App() {
  const spinTimeoutRef = useRef(null)
  const [path, setPath] = useState(window.location.pathname || '/')
  const [serverNow, setServerNow] = useState(Date.now())
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [authUser, setAuthUser] = useState(null)
  const [appFeedback, setAppFeedback] = useState(null)
  const [isHomeLoading, setIsHomeLoading] = useState(true)
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)
  const [isDailyChancesLoading, setIsDailyChancesLoading] = useState(false)
  const [isAdminOverviewLoading, setIsAdminOverviewLoading] = useState(false)
  const [draws, setDraws] = useState([])
  const [winners, setWinners] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [banks, setBanks] = useState([])
  const [dashboardData, setDashboardData] = useState(emptyDashboard)
  const [transactions, setTransactions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notificationsUnreadCount, setNotificationsUnreadCount] = useState(0)
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)
  const [depositRequests, setDepositRequests] = useState([])
  const [isFundingOpen, setIsFundingOpen] = useState(false)
  const [entryDraw, setEntryDraw] = useState(null)
  const [selectedDrawDetails, setSelectedDrawDetails] = useState(null)
  const [entryCelebration, setEntryCelebration] = useState(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isInstallOpen, setIsInstallOpen] = useState(false)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null)
  const [spinSettings, setSpinSettings] = useState({
    spinCost: 15,
    maxDailyPayout: 5000,
    maxSingleReward: 1000,
    dailySpinLimit: 1,
    rewards: [],
  })
  const [spinState, setSpinState] = useState(emptySpinState)
  const [quizToday, setQuizToday] = useState(null)
  const [quizState, setQuizState] = useState(emptyQuizState)
  const [adminOverview, setAdminOverview] = useState({
    totalUsers: 0,
    pendingDeposits: 0,
    activeDraws: 0,
    scheduledQuizzes: 0,
  })
  const [adminParticipants, setAdminParticipants] = useState([])
  const [adminDraws, setAdminDraws] = useState([])
  const [adminReferrals, setAdminReferrals] = useState({
    totalReferredUsers: 0,
    latestRelationships: [],
  })
  const [adminUsers, setAdminUsers] = useState([])
  const [adminUserDetail, setAdminUserDetail] = useState(null)
  const [isAdminUserLoading, setIsAdminUserLoading] = useState(false)
  const [adminUserDetailError, setAdminUserDetailError] = useState('')
  const [walletStats, setWalletStats] = useState(emptyWalletStats)
  const [scheduledQuizzes, setScheduledQuizzes] = useState([])
  const [notificationSettings, setNotificationSettings] = useState({
    fundingApproved: true,
    prizeWon: true,
    referralReward: true,
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
    const hasSeenInfo = window.localStorage.getItem('vq-info-seen')
    if (!hasSeenInfo) {
      setIsInfoOpen(true)
    }
  }, [])

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredInstallPrompt(event)
    }

    const firstVisitAt = window.localStorage.getItem('vq-first-visit-at')
    if (!firstVisitAt) {
      window.localStorage.setItem('vq-first-visit-at', String(Date.now()))
    }

    const timer = window.setTimeout(() => {
      setIsInstallOpen(true)
    }, 30_000)

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    }
  }, [])

  const navigate = (nextPath) => {
    if (nextPath === path) return
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
    setIsNotificationsOpen(false)
    setAppFeedback(null)
  }

  const openInfoModal = () => {
    setIsInfoOpen(true)
  }

  const closeInfoModal = () => {
    window.localStorage.setItem('vq-info-seen', 'true')
    setIsInfoOpen(false)
  }

  const handleInstallApp = async () => {
    if (!deferredInstallPrompt) return

    await deferredInstallPrompt.prompt()
    await deferredInstallPrompt.userChoice.catch(() => {})
    setDeferredInstallPrompt(null)
    setIsInstallOpen(false)
  }

  const showAppError = useCallback((error, fallbackMessage = 'Something went wrong. Please try again.') => {
    const message = error instanceof Error ? error.message : fallbackMessage
    setAppFeedback({
      type: 'error',
      message,
    })
  }, [])

  const applyHomeSnapshot = useCallback((payload) => {
    const heroDraws = payload?.critical?.heroDraws || []
    setDraws(
      heroDraws.map((draw) => ({
        ...draw,
        drawRef: draw.drawId,
        image: draw.coverImage,
        status: draw.status,
      })),
    )
    setServerNow(payload?.serverNow ? new Date(payload.serverNow).getTime() : Date.now())
    if ((payload?.secondary?.winnersPreview || []).length) {
      setWinners(mapWinners(payload.secondary.winnersPreview))
    }
  }, [])

  const loadPublicData = useCallback(async () => {
    setIsHomeLoading(true)
    try {
      const payload = await apiRequest('/api/app/home')
      applyHomeSnapshot(payload)
    } finally {
      setIsHomeLoading(false)
    }
  }, [applyHomeSnapshot])

  const clearAuthenticatedState = useCallback(() => {
    setIsAuthenticated(false)
    setAuthUser(null)
    setDashboardData(emptyDashboard)
    setTransactions([])
    setNotifications([])
    setNotificationsUnreadCount(0)
    setDepositRequests([])
    setAdminOverview({
      totalUsers: 0,
      pendingDeposits: 0,
      activeDraws: 0,
      scheduledQuizzes: 0,
    })
    setAdminParticipants([])
    setAdminDraws([])
    setAdminReferrals({
      totalReferredUsers: 0,
      latestRelationships: [],
    })
    setAdminUsers([])
    setAdminUserDetail(null)
    setIsAdminUserLoading(false)
    setAdminUserDetailError('')
    setWalletStats(emptyWalletStats)
    setScheduledQuizzes([])
    setSpinState((prev) => ({
      ...emptySpinState,
      rotation: prev.rotation,
    }))
    setQuizState(emptyQuizState)
  }, [])

  const applyDashboardSnapshot = useCallback((dashboardResponse) => {
    const critical = dashboardResponse?.critical || {}
    const secondary = dashboardResponse?.secondary || {}

    setDashboardData({
      user: critical.user
        ? {
            id: critical.user.id,
            name: critical.user.fullName,
            referenceId: critical.user.referenceId,
            role: critical.user.role,
          }
        : null,
      wallet: critical.wallet
        ? {
            balance: Number(critical.wallet.balance || 0),
          }
        : null,
      participations: Number(critical.summary?.participations || 0),
      wins: Number(critical.summary?.wins || 0),
      recentEntries: secondary.recentEntries || [],
      latestNotifications: critical.notifications?.latest || [],
      winnerNotice: critical.winnerNotice || null,
      referralSummary: {
        referralCode: critical.referrals?.code || critical.user?.referenceId || 'PENDING_REF',
        totalReferrals: Number(critical.referrals?.total || 0),
        successfulReferrals: Number(critical.referrals?.successful || 0),
        totalRewardsEarned: Number(critical.referrals?.earned || 0),
        recentActivity: secondary.referralActivity || [],
      },
    })
    setTransactions(mapTransactions(secondary.recentTransactions || []))
    setNotificationsUnreadCount(Number(critical.notifications?.unreadCount || 0))
    if ((critical.notifications?.latest || []).length) {
      setNotifications(mapNotifications(critical.notifications.latest))
    }
    setSpinState((prev) => ({
      ...prev,
      hasSpunToday: Boolean(critical.spinStatus?.hasSpunToday),
    }))
    setQuizState(
      critical.quizStatus?.attemptedToday
        ? {
            answered: true,
            isCorrect: Boolean(critical.quizStatus?.isCorrect),
            reward: Number(critical.quizStatus?.rewardAmount || 0),
          }
        : emptyQuizState,
    )
  }, [])

  const loadAdminData = useCallback(async (targetPath = path) => {
    const requests = []
    const applyResult = []

    if (targetPath === '/admin') {
      requests.push(apiRequest('/api/app/admin-overview'))
      applyResult.push((overviewResponse) => {
        if (!overviewResponse) return

        setAdminOverview({
          totalUsers: Number(overviewResponse.critical?.totals?.totalUsers || 0),
          pendingDeposits: Number(overviewResponse.critical?.totals?.pendingWalletDeposits || 0),
          activeDraws: Number(overviewResponse.critical?.totals?.activeDraws || 0),
          scheduledQuizzes: 0,
        })
        setAdminParticipants((overviewResponse.secondary?.participants || []).map(normalizeParticipantRow))
        setAdminDraws(flattenDraws(overviewResponse.secondary?.managedDraws || []))
        setAdminReferrals(overviewResponse.critical?.referralStats || {
          totalReferredUsers: 0,
          latestRelationships: [],
        })
      })
    }

    if (targetPath === '/admin/create-draw') {
      requests.push(apiRequest('/api/draws/manage'))
      applyResult.push((managedDrawsResponse) => {
        if (managedDrawsResponse) {
          setAdminDraws(flattenDraws(managedDrawsResponse.draws || []))
        }
      })
    }

    if (targetPath === '/admin/deposits') {
      requests.push(apiRequest('/api/funding/moderation'))
      applyResult.push((depositsResponse) => {
        if (depositsResponse) {
          setDepositRequests((depositsResponse.fundingRequests || []).map((item) => ({
            id: item.id,
            userId: item.userId,
            referenceId: item.referenceId,
            amount: Number(item.amount || 0),
            timestamp: formatDisplayDate(item.createdAt, item.timestamp),
            status: item.status ? item.status[0].toUpperCase() + item.status.slice(1) : 'Pending',
            proofUrl: item.proofUrl,
          })))
        }
      })
    }

    if (targetPath === '/admin/users' || targetPath.startsWith('/admin/users/')) {
      requests.push(apiRequest('/api/admin/users'))
      applyResult.push((usersResponse) => {
        if (usersResponse) {
          setAdminUsers((usersResponse.users || []).map(normalizeUserRow))
        }
      })
    }

    if (targetPath === '/admin/wallet-stats') {
      requests.push(apiRequest('/api/admin/wallet-stats'))
      applyResult.push((walletStatsResponse) => {
        if (walletStatsResponse) {
          setWalletStats({
            totalWalletBalance: Number(walletStatsResponse.totalWalletBalance || 0),
            totalDeposits: Number(walletStatsResponse.totalDeposits || 0),
            totalSpentOnEntries: Number(walletStatsResponse.totalSpentOnEntries || 0),
            totalSpentOnSpins: Number(walletStatsResponse.totalSpentOnSpins || 0),
            totalRewardsPaid: Number(walletStatsResponse.totalRewardsPaid || 0),
            transactions: mapTransactions(walletStatsResponse.transactions || []),
          })
        }
      })
    }

    if (targetPath === '/admin/quiz') {
      requests.push(apiRequest('/api/quiz/scheduled'))
      applyResult.push((quizzesResponse) => {
        if (quizzesResponse) {
          setScheduledQuizzes((quizzesResponse.quizzes || []).map(normalizeQuizRow))
        }
      })
    }

    if (targetPath === '/admin/spin-settings') {
      requests.push(apiRequest('/api/spin/settings'))
      applyResult.push((spinSettingsResponse) => {
        if (spinSettingsResponse) {
          setSpinSettings(mapSpinSettings(spinSettingsResponse))
        }
      })
    }

    if (targetPath === '/admin/notifications') {
      requests.push(apiRequest('/api/notifications/settings'))
      applyResult.push((notificationSettingsResponse) => {
        if (notificationSettingsResponse?.settings) {
          setNotificationSettings(notificationSettingsResponse.settings)
        }
      })
    }

    if (targetPath === '/admin/banks') {
      requests.push(apiRequest('/api/banks'))
      applyResult.push((banksResponse) => {
        if (banksResponse) {
          setBanks(mapBanks(banksResponse.banks || banksResponse))
        }
      })
    }

    const results = await Promise.allSettled(requests)
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        applyResult[index](result.value)
      }
    })
  }, [path])

  const loadAuthenticatedData = useCallback(async () => {
    const dashboardResponse = await apiRequest('/api/app/dashboard')
    if (!dashboardResponse?.critical?.user) {
      throw new Error('We could not load your dashboard right now. Please try again.')
    }

    applyDashboardSnapshot(dashboardResponse)
    const user = {
      id: dashboardResponse.critical.user.id,
      name: dashboardResponse.critical.user.fullName,
      referenceId: dashboardResponse.critical.user.referenceId,
      role: normalizeRole(dashboardResponse.critical.user.role),
    }
    setAuthUser(user)
    setIsAuthenticated(true)

    if (user.role !== 'admin') {
      setAdminOverview({
        totalUsers: 0,
        pendingDeposits: 0,
        activeDraws: 0,
        scheduledQuizzes: 0,
      })
      setAdminParticipants([])
      setAdminDraws([])
      setAdminReferrals({
        totalReferredUsers: 0,
        latestRelationships: [],
      })
      setAdminUsers([])
      setAdminUserDetail(null)
      setWalletStats(emptyWalletStats)
      setScheduledQuizzes([])
    }
  }, [applyDashboardSnapshot])

  // Only switch the shell into the authenticated state after user-scoped
  // data is ready, so the navbar and protected routes update together.
  const refreshSession = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) {
      setIsAuthLoading(true)
    }
    try {
      if (showLoader) {
        setIsDashboardLoading(true)
      }
      await loadAuthenticatedData()
      setAppFeedback(null)
    } catch (_error) {
      clearAuthenticatedState()
    } finally {
      setIsDashboardLoading(false)
      if (showLoader) {
        setIsAuthLoading(false)
      }
    }
  }, [clearAuthenticatedState, loadAuthenticatedData])

  const refreshAppData = useCallback(async () => {
    await Promise.allSettled([
      loadPublicData().catch((error) => {
        console.error(error)
      }),
      refreshSession({ showLoader: true }),
    ])
  }, [loadPublicData, refreshSession])

  const refreshAfterMutation = useCallback(async ({ includeAdmin = false, includeSession = true } = {}) => {
    const tasks = [
      loadPublicData().catch((error) => {
        console.error(error)
      }),
    ]

    if (includeSession && isAuthenticated) {
      tasks.push(refreshSession({ showLoader: false }))
    }

    if (includeAdmin && authUser?.role === 'admin') {
      tasks.push(loadAdminData())
    }

    await Promise.allSettled(tasks)
  }, [authUser?.role, isAuthenticated, loadAdminData, loadPublicData, refreshSession])

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return

    setIsNotificationsLoading(true)
    try {
      const notificationsResponse = await apiRequest('/api/notifications')
      const nextNotifications = mapNotifications(notificationsResponse.notifications || notificationsResponse)
      setNotifications(nextNotifications)
      setNotificationsUnreadCount(nextNotifications.filter((item) => !item.isRead).length)
    } finally {
      setIsNotificationsLoading(false)
    }
  }, [isAuthenticated])

  const markNotificationsSeen = useCallback(async () => {
    if (!isAuthenticated) return

    const hasUnread = notificationsUnreadCount > 0
    if (!hasUnread) return

    // Reset the badge immediately so the UI responds as soon as the user
    // opens the notification center, then persist the read state server-side.
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
    setNotificationsUnreadCount(0)
    await apiRequest('/api/notifications/read-all', {
      method: 'PATCH',
      body: {},
    })
  }, [isAuthenticated, notificationsUnreadCount])

  const refreshWalletTransactions = useCallback(async () => {
    if (!isAuthenticated) return

    const transactionsResponse = await apiRequest('/api/wallet/transactions')
    setTransactions(mapTransactions(transactionsResponse.transactions || []))
  }, [isAuthenticated])

  const refreshDashboardSnapshot = useCallback(async () => {
    if (!isAuthenticated) return

    const dashboardResponse = await apiRequest('/api/app/dashboard')
    applyDashboardSnapshot(dashboardResponse)
  }, [applyDashboardSnapshot, isAuthenticated])

  const refreshDailyChancesSnapshot = useCallback(async () => {
    if (!isAuthenticated) return

    setIsDailyChancesLoading(true)
    try {
      const payload = await apiRequest('/api/app/daily-chances')
      const critical = payload?.critical || {}

      setSpinSettings((prev) => ({
        ...prev,
        spinCost: Number(critical.spin?.spinCost || prev.spinCost),
        rewards: (critical.spin?.rewards || []).map((reward) => ({
          id: reward.id,
          label: reward.label,
          type: reward.rewardType,
          amount: Number(reward.rewardAmount || 0),
        })),
      }))
      setSpinState((prev) => ({
        ...prev,
        hasSpunToday: Boolean(critical.spin?.hasSpunToday),
      }))
      setQuizToday(critical.quiz || null)
      setQuizState(
        critical.quiz?.answered
          ? {
              answered: true,
              isCorrect: Boolean(critical.quiz?.isCorrect),
              reward: Number(critical.quiz?.rewardAmount || 0),
            }
          : emptyQuizState,
      )
      setDashboardData((prev) => ({
        ...prev,
        wallet: {
          balance: Number(critical.walletBalance || prev.wallet?.balance || 0),
        },
      }))
    } finally {
      setIsDailyChancesLoading(false)
    }
  }, [isAuthenticated])

  const refreshBanks = useCallback(async () => {
    const banksResponse = await apiRequest('/api/banks')
    setBanks(mapBanks(banksResponse.banks || banksResponse))
  }, [])

  const refreshWinnersAndTestimonials = useCallback(async () => {
    const [winnersResponse, testimonialsResponse] = await Promise.all([
      apiRequest('/api/winners'),
      apiRequest('/api/testimonials'),
    ])

    setWinners(mapWinners(winnersResponse.winners || winnersResponse))
    setTestimonials(mapTestimonials(testimonialsResponse.testimonials || []))
  }, [])

  useEffect(() => {
    void refreshAppData()
  }, [refreshAppData])

  useEffect(() => {
    if (path !== '/') return

    // Refresh public-facing draw data when the user navigates back to Home so
    // the latest published draws appear without a hard browser reload.
    void loadPublicData().catch((error) => {
      console.error(error)
    })
  }, [loadPublicData, path])

  useEffect(() => {
    if (!isAuthenticated || authUser?.role !== 'admin' || !path.startsWith('/admin')) {
      return
    }

    // Admin-only datasets are loaded lazily when an admin route is open so
    // normal account navigation does not pay the cost for admin tables.
    setIsAdminOverviewLoading(path === '/admin')
    void loadAdminData()
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        setIsAdminOverviewLoading(false)
      })
  }, [authUser?.role, isAuthenticated, loadAdminData, path])

  useEffect(() => {
    if (!path.startsWith('/admin/users/') || !isAuthenticated || authUser?.role !== 'admin') {
      setAdminUserDetail(null)
      setIsAdminUserLoading(false)
      setAdminUserDetailError('')
      return
    }

    const userId = path.split('/').pop()
    if (!userId) return

    const loadUserDetail = async () => {
      setIsAdminUserLoading(true)
      setAdminUserDetailError('')
      try {
        const response = await apiRequest(`/api/admin/users/${userId}`)
        if (!response.user) {
          setAdminUserDetail(null)
          setAdminUserDetailError('User not found.')
          return
        }

        setAdminUserDetail({
          user: normalizeUserRow({
            ...response.user,
            walletBalance: response.wallet?.balance || 0,
          }),
          history: {
            transactions: mapTransactions(response.transactions || []),
            participations: (response.participations || []).map((item) => ({
              id: item.id,
              draw: item.prizeTitle || item.draw || 'Prize Entry',
              date: formatDisplayDate(item.createdAt, item.date),
              status: 'Entered',
            })),
            wins: (response.wins || []).map((item) => ({
              id: item.id,
              prize: item.prizeTitle,
              date: formatDisplayDay(item.announcedAt, item.date),
            })),
          },
        })
      } catch (error) {
        console.error(error)
        setAdminUserDetail(null)
        setAdminUserDetailError('We could not load this user right now.')
      } finally {
        setIsAdminUserLoading(false)
      }
    }

    void loadUserDetail()
  }, [authUser?.role, isAuthenticated, path])

  useEffect(() => {
    if (!isAuthenticated || path !== '/notifications') return

    void (async () => {
      try {
        await refreshNotifications()
        await markNotificationsSeen()
      } catch (error) {
        console.error(error)
      }
    })()
  }, [isAuthenticated, markNotificationsSeen, path, refreshNotifications])

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading || path !== '/dashboard') return

    // Refresh dashboard-specific data in the background so external updates,
    // like referral rewards or approved funding, appear faster without a full reload.
    void refreshDashboardSnapshot().catch((error) => {
        console.error(error)
      })
  }, [isAuthLoading, isAuthenticated, path, refreshDashboardSnapshot])

  useEffect(() => {
    if (!isAuthenticated || path !== '/daily-chances') return

    void refreshDailyChancesSnapshot().catch((error) => {
      console.error(error)
    })
  }, [isAuthenticated, path, refreshDailyChancesSnapshot])

  useEffect(() => {
    if (!isAuthenticated || path !== '/wallet') return
    if (transactions.length) return

    void refreshWalletTransactions().catch((error) => {
      console.error(error)
    })
  }, [isAuthenticated, path, refreshWalletTransactions, transactions.length])

  useEffect(() => {
    const needsBanks = path === '/wallet' || path === '/admin/banks' || isFundingOpen
    if (!needsBanks) return
    if (banks.length) return

    void refreshBanks().catch((error) => {
      console.error(error)
    })
  }, [banks.length, isFundingOpen, path, refreshBanks])

  useEffect(() => {
    const needsWinnerData = path === '/winners' || path === '/testimonials' || path === '/admin/winners'
    if (!needsWinnerData) return
    if (winners.length && testimonials.length) return

    void refreshWinnersAndTestimonials().catch((error) => {
      console.error(error)
    })
  }, [path, refreshWinnersAndTestimonials, testimonials.length, winners.length])

  useEffect(() => {
    if (!isAuthenticated) return

    const handleFocusRefresh = () => {
      if (protectedUserPaths.includes(path)) {
        void refreshDashboardSnapshot().catch((error) => {
          console.error(error)
        })
      }

      if (path === '/daily-chances') {
        void refreshDailyChancesSnapshot().catch((error) => {
          console.error(error)
        })
      }

      if (path === '/wallet') {
        void refreshWalletTransactions().catch((error) => {
          console.error(error)
        })
      }

      if (path === '/notifications' || isNotificationsOpen) {
        void refreshNotifications().catch((error) => {
          console.error(error)
        })
      }
    }

    window.addEventListener('focus', handleFocusRefresh)
    return () => {
      window.removeEventListener('focus', handleFocusRefresh)
    }
  }, [isAuthenticated, isNotificationsOpen, path, refreshDailyChancesSnapshot, refreshDashboardSnapshot, refreshNotifications, refreshWalletTransactions])

  const sharedUser = useMemo(() => {
    if (!dashboardData.user) {
      return {
        fullName: 'Guest User',
        referenceId: 'VQ---',
        walletBalance: 0,
        participations: 0,
        wins: 0,
        userId: '',
        referralSummary: {
          referralCode: 'VQ---',
          totalReferrals: 0,
          successfulReferrals: 0,
          totalRewardsEarned: 0,
          recentActivity: [],
        },
      }
    }

    return {
      fullName: dashboardData.user.name,
      referenceId: dashboardData.user.referenceId || 'PENDING_REF',
      walletBalance: Number(dashboardData.wallet?.balance || 0),
      participations: dashboardData.participations || 0,
      wins: dashboardData.wins || 0,
      userId: dashboardData.user.id,
      referralSummary: dashboardData.referralSummary || {
        referralCode: dashboardData.user.referenceId || 'PENDING_REF',
        totalReferrals: 0,
        successfulReferrals: 0,
        totalRewardsEarned: 0,
        recentActivity: [],
      },
    }
  }, [dashboardData])

  const recentEntries = useMemo(
    () =>
      (dashboardData.recentEntries || []).map((entry) => ({
        id: entry.id,
        prizeTitle: entry.prizeTitle,
        fee: Number(entry.entryFee || entry.fee || 0),
        date: formatDisplayDate(entry.createdAt, entry.date),
      })),
    [dashboardData.recentEntries],
  )

  const walletBalance = sharedUser.walletBalance

  const applyUpdatedAdminUser = useCallback((updatedUser) => {
    if (!updatedUser) return

    const normalizedUser = normalizeUserRow(updatedUser)
    setAdminUsers((prev) =>
      prev.map((user) => (user.id === normalizedUser.id ? { ...user, ...normalizedUser } : user)),
    )
    setAdminUserDetail((prev) =>
      prev?.user?.id === normalizedUser.id
        ? {
            ...prev,
            user: {
              ...prev.user,
              ...normalizedUser,
            },
          }
        : prev,
    )
  }, [])

  const applyUpdatedDeposit = useCallback((updatedDeposit) => {
    if (!updatedDeposit) return

    setDepositRequests((prev) =>
      prev.map((deposit) =>
        deposit.id === updatedDeposit.id
          ? {
              ...deposit,
              status: updatedDeposit.status ? updatedDeposit.status[0].toUpperCase() + updatedDeposit.status.slice(1) : deposit.status,
              timestamp: formatDisplayDate(updatedDeposit.createdAt, deposit.timestamp),
            }
          : deposit,
      ),
    )
  }, [])

  const handleToggleNotifications = async () => {
    const shouldOpen = !isNotificationsOpen
    setIsNotificationsOpen(shouldOpen)

    if (shouldOpen) {
      // Open immediately with cached data, then refresh in the background so
      // the bell feels responsive even on slower connections.
      void refreshNotifications().catch((error) => {
        console.error(error)
      })
      void markNotificationsSeen().catch((error) => {
        console.error(error)
      })
    }
  }

  const handleLogin = async (formState) => {
    await apiRequest('/api/auth/login', {
      method: 'POST',
      body: formState,
    })
    await refreshSession()
    navigate('/dashboard')
  }

  const handleSignup = async (formState) => {
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: formState,
    })
    await refreshSession()
    navigate('/dashboard')
  }

  const handleLogout = async () => {
    try {
      if (isAuthenticated) {
        await apiRequest('/api/auth/logout', { method: 'POST' })
      }
    } catch (_error) {
      // Logout should still clear local UI even if the request fails.
    }

    clearAuthenticatedState()
    setEntryDraw(null)
    setIsFundingOpen(false)
    navigate('/')
    await loadPublicData()
  }

  const handleEnterDraw = (draw) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!isDrawEntryOpen(draw.status)) return
    setSelectedDrawDetails(null)
    setEntryDraw(draw)
  }

  const handleViewDraw = (draw) => {
    setSelectedDrawDetails(draw)
  }

  const handleConfirmEntry = async () => {
    if (!entryDraw) return

    try {
      await apiRequest(`/api/draws/${entryDraw.drawId}/enter`, {
        method: 'POST',
        body: {
          drawPrizeId: entryDraw.drawPrizeId,
        },
      })

      setEntryCelebration({
        title: entryDraw.title,
        fee: entryDraw.entryFee,
      })
      setEntryDraw(null)
      await refreshAfterMutation({ includeSession: true })
    } catch (error) {
      showAppError(error)
    }
  }

  const handleSubmitFunding = async (amount) => {
    try {
      const formData = new FormData()
      formData.append('amount', String(amount))

      const response = await apiRequest('/api/funding/requests', {
        method: 'POST',
        body: formData,
        isFormData: true,
      })

      if (response.fundingRequest) {
        setDepositRequests((prev) => [
          {
            id: response.fundingRequest.id,
            userId: response.fundingRequest.userId,
            referenceId: response.fundingRequest.referenceId,
            amount: Number(response.fundingRequest.amount || 0),
            timestamp: formatDisplayDate(response.fundingRequest.createdAt, 'Just now'),
            status: 'Pending',
            proofUrl: response.fundingRequest.proofUrl,
          },
          ...prev,
        ])
      }

      return response.fundingRequest
    } catch (error) {
      showAppError(error)
      throw error
    }
  }

  const handleSpin = async () => {
    if (
      spinState.hasSpunToday ||
      spinState.isSpinning ||
      walletBalance < spinSettings.spinCost ||
      !spinSettings.rewards.length
    ) {
      return
    }

    const warmupRotation = spinState.rotation + 540

    // Start the wheel immediately so the experience feels responsive while the
    // backend validates eligibility and picks the reward.
    setSpinState((prev) => ({
      ...prev,
      isSpinning: true,
      isPriming: true,
      rotation: warmupRotation,
      result: null,
      showResultModal: false,
    }))

    try {
      const result = await apiRequest('/api/spin', {
        method: 'POST',
        body: {},
      })

      const segmentAngle = 360 / spinSettings.rewards.length
      const targetAngle = 360 - (result.wheelSegment * segmentAngle)
      const fullTurns = 5 * 360
      const nextRotation = warmupRotation + fullTurns + targetAngle

      window.requestAnimationFrame(() => {
        setSpinState({
          hasSpunToday: true,
          isSpinning: true,
          isPriming: false,
          rotation: nextRotation,
          result: null,
          showResultModal: false,
        })
      })

      spinTimeoutRef.current = window.setTimeout(async () => {
        setSpinState({
          hasSpunToday: true,
          isSpinning: false,
          isPriming: false,
          rotation: nextRotation,
          result: {
            ...result.reward,
            label: result.reward.label,
          },
          showResultModal: true,
        })
        await refreshDashboardSnapshot()
        await refreshWalletTransactions().catch(() => {})
        spinTimeoutRef.current = null
      }, 6000)
    } catch (error) {
      setSpinState((prev) => ({
        ...prev,
        isSpinning: false,
        isPriming: false,
        result: null,
        showResultModal: false,
      }))
      showAppError(error)
    }
  }

  const handleQuizAnswer = async (selectedOption) => {
    if (!quizToday || quizState.answered) return

    try {
      const result = await apiRequest('/api/quiz/answer', {
        method: 'POST',
        body: {
          quizId: quizToday.id,
          selectedOption,
        },
      })

      setQuizState({
        answered: true,
        isCorrect: result.isCorrect,
        reward: Number(result.rewardAmount || 0),
      })
      await refreshDashboardSnapshot()
      await refreshWalletTransactions().catch(() => {})
    } catch (error) {
      showAppError(error)
    }
  }

  const handleApproveDeposit = async (depositId) => {
    try {
      const response = await apiRequest(`/api/funding/moderation/${depositId}/approve`, {
        method: 'POST',
        body: {},
      })
      applyUpdatedDeposit(response.fundingRequest)
      if (path === '/admin/wallet-stats') {
        await loadAdminData('/admin/wallet-stats')
      }
    } catch (error) {
      showAppError(error)
    }
  }

  const handleRejectDeposit = async (depositId) => {
    try {
      const response = await apiRequest(`/api/funding/moderation/${depositId}/reject`, {
        method: 'POST',
        body: {},
      })
      applyUpdatedDeposit(response.fundingRequest)
    } catch (error) {
      showAppError(error)
    }
  }

  const handleDrawStatusOverride = async (drawId, nextStatus) => {
    try {
      await apiRequest(`/api/draws/${drawId}/status`, {
        method: 'PATCH',
        body: {
          status: nextStatus,
        },
      })
      await refreshAfterMutation({ includeAdmin: true, includeSession: false })
    } catch (error) {
      showAppError(error)
    }
  }

  const handleCloseDraw = async (drawId) => {
    try {
      await apiRequest(`/api/draws/${drawId}/close`, {
        method: 'POST',
        body: {},
      })
      await refreshAfterMutation({ includeAdmin: true, includeSession: false })
    } catch (error) {
      showAppError(error)
    }
  }

  const handleBanToggle = async (userId) => {
    const user = adminUsers.find((item) => item.id === userId) || adminUserDetail?.user
    if (!user) return

    const nextStatus = user.accountStatus === 'Suspended' ? 'active' : 'suspended'
    try {
      const response = await apiRequest(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: {
          status: nextStatus,
        },
      })

      applyUpdatedAdminUser(response.user)
      if (authUser?.id === userId) {
        await refreshSession({ showLoader: false })
      }
    } catch (error) {
      showAppError(error)
    }
  }

  const handleRoleChange = async (userId, role) => {
    try {
      const response = await apiRequest(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: {
          role,
        },
      })

      applyUpdatedAdminUser(response.user)
      if (authUser?.id === userId) {
        await refreshSession({ showLoader: false })
      }
    } catch (error) {
      showAppError(error)
    }
  }

  const handleAdjustWallet = async (userId, amount, reason) => {
    try {
      await apiRequest('/api/admin/wallet-adjustments', {
        method: 'POST',
        body: {
          userId,
          amount,
          reason,
        },
      })

      if (path.startsWith('/admin/users/')) {
        await loadAdminData('/admin/wallet-stats').catch(() => {})
        const response = await apiRequest(`/api/admin/users/${userId}`)
        if (response.user) {
          setAdminUserDetail({
            user: normalizeUserRow({
              ...response.user,
              walletBalance: response.wallet?.balance || 0,
            }),
            history: {
              transactions: mapTransactions(response.transactions || []),
              participations: (response.participations || []).map((item) => ({
                id: item.id,
                draw: item.prizeTitle || item.draw || 'Prize Entry',
                date: formatDisplayDate(item.createdAt, item.date),
                status: 'Entered',
              })),
              wins: (response.wins || []).map((item) => ({
                id: item.id,
                prize: item.prizeTitle,
                date: formatDisplayDay(item.announcedAt, item.date),
              })),
            },
          })
        }
      }
    } catch (error) {
      showAppError(error)
    }
  }

  const handleAddBank = async (bank) => {
    try {
      await apiRequest('/api/banks', {
        method: 'POST',
        body: bank,
      })
      await refreshAfterMutation({ includeAdmin: true, includeSession: false })
    } catch (error) {
      showAppError(error)
    }
  }

  const handleUpdateBank = async (bankId, field, value) => {
    try {
      await apiRequest(`/api/banks/${bankId}`, {
        method: 'PATCH',
        body: {
          [field]: value,
        },
      })
      await refreshAfterMutation({ includeAdmin: true, includeSession: false })
    } catch (error) {
      showAppError(error)
    }
  }

  const handleRemoveBank = async (bankId) => {
    try {
      await apiRequest(`/api/banks/${bankId}`, {
        method: 'DELETE',
      })
      await refreshAfterMutation({ includeAdmin: true, includeSession: false })
    } catch (error) {
      showAppError(error)
    }
  }

  const handleSubmitTestimonial = async ({ winningDate, message }, images) => {
    const latestWin = winners.find((winner) => winner.referenceId === sharedUser.referenceId)
    if (!latestWin) {
      showAppError(new Error('Only verified winners can submit testimonials.'))
      return
    }

    try {
      const formData = new FormData()
      formData.append('prizeTitle', latestWin.prizeTitle)
      formData.append('winningDate', new Date(winningDate).toISOString())
      formData.append('message', message)
      images.forEach((image) => formData.append('images', image))

      await apiRequest('/api/testimonials', {
        method: 'POST',
        body: formData,
        isFormData: true,
      })

      await refreshAfterMutation({ includeSession: true })
    } catch (error) {
      showAppError(error)
    }
  }

  const handleCreateDraw = async (slotNumber, formState) => {
    const galleryImageUrls = formState.galleryImageUrls
      ? formState.galleryImageUrls.split('\n').map((value) => value.trim()).filter(Boolean).slice(0, 2)
      : []
    const formData = new FormData()
    formData.append('slotNumber', String(slotNumber))
    formData.append('drawDay', formState.drawDay)
    formData.append('goLiveMode', formState.goLiveMode)
    if (formState.goLiveMode === 'schedule' && formState.scheduledAt) {
      formData.append('startTime', new Date(formState.scheduledAt).toISOString())
    }
    if (formState.endTime) {
      formData.append('endTime', new Date(formState.endTime).toISOString())
    }

    formData.append(
      'prizes',
      JSON.stringify([
        {
          title: formState.title,
          description: formState.description,
          entryFee: Number(formState.entryFee),
          prizeValue: Number(formState.prizeValue),
          imageUrl: formState.imageUrl || undefined,
          imageUrls: galleryImageUrls,
          maxEntries: Number(formState.maxEntries),
        },
      ]),
    )

    ;(formState.imageFile || []).forEach((file) => formData.append('images', file))

    const response = await apiRequest('/api/draws', {
      method: 'POST',
      body: formData,
      isFormData: true,
    })

    await refreshAfterMutation({ includeAdmin: true, includeSession: false })
    return {
      startLabel: formatDisplayDate(response.draw.startTime, 'Live now'),
    }
  }

  const handleUpdateDraw = async (drawId, formState) => {
    const galleryImageUrls = formState.galleryImageUrls
      ? formState.galleryImageUrls.split('\n').map((value) => value.trim()).filter(Boolean).slice(0, 2)
      : []
    const formData = new FormData()
    formData.append('title', formState.title)
    formData.append('description', formState.description || '')
    formData.append('entryFee', String(Number(formState.entryFee)))
    formData.append('prizeValue', String(Number(formState.prizeValue)))
    formData.append('imageUrl', formState.imageUrl || '')
    formData.append('imageUrls', JSON.stringify(galleryImageUrls))
    formData.append('maxEntries', String(Number(formState.maxEntries)))
    formData.append('drawDay', formState.drawDay)
    formData.append('goLiveMode', formState.goLiveMode)
    formData.append('status', formState.status || 'available')
    if (formState.goLiveMode === 'schedule' && formState.scheduledAt) {
      formData.append('startTime', new Date(formState.scheduledAt).toISOString())
    }
    if (formState.endTime) {
      formData.append('endTime', new Date(formState.endTime).toISOString())
    }
    ;(formState.imageFile || []).forEach((file) => formData.append('images', file))

    await apiRequest(`/api/draws/${drawId}`, {
      method: 'PATCH',
      body: formData,
      isFormData: true,
    })
    await refreshAfterMutation({ includeAdmin: true, includeSession: false })
  }

  const handleDeleteDraw = async (drawId) => {
    await apiRequest(`/api/draws/${drawId}`, {
      method: 'DELETE',
    })
    await refreshAfterMutation({ includeAdmin: true, includeSession: false })
  }

  const handleCreateQuiz = async (formState) => {
    await apiRequest('/api/quiz', {
      method: 'POST',
      body: {
        question: formState.question,
        optionA: formState.optionA,
        optionB: formState.optionB,
        optionC: formState.optionC,
        optionD: formState.optionD,
        correctAnswer: formState.correctAnswer,
        rewardAmount: Number(formState.rewardAmount),
        goLiveMode: formState.goLiveMode,
        scheduledAt:
          formState.goLiveMode === 'schedule' && formState.scheduledAt
            ? new Date(formState.scheduledAt).toISOString()
            : undefined,
      },
    })

    await refreshAfterMutation({ includeAdmin: true, includeSession: false })
  }

  const handleUpdateQuiz = async (quizId, formState) => {
    await apiRequest(`/api/quiz/${quizId}`, {
      method: 'PATCH',
      body: {
        question: formState.question,
        optionA: formState.optionA,
        optionB: formState.optionB,
        optionC: formState.optionC,
        optionD: formState.optionD,
        correctAnswer: formState.correctAnswer,
        rewardAmount: Number(formState.rewardAmount),
        goLiveMode: formState.goLiveMode,
        scheduledAt:
          formState.goLiveMode === 'schedule' && formState.scheduledAt
            ? new Date(formState.scheduledAt).toISOString()
            : undefined,
      },
    })
    await refreshAfterMutation({ includeAdmin: true, includeSession: false })
  }

  const handleDeleteQuiz = async (quizId) => {
    await apiRequest(`/api/quiz/${quizId}`, {
      method: 'DELETE',
    })
    await refreshAfterMutation({ includeAdmin: true, includeSession: false })
  }

  const handlePublishQuiz = async (quizId) => {
    await apiRequest(`/api/quiz/${quizId}/publish`, {
      method: 'POST',
      body: {},
    })
    await refreshAfterMutation({ includeAdmin: true, includeSession: false })
  }

  const handleUpdateSpinSettings = async (settings) => {
    try {
      await apiRequest('/api/spin/settings', {
        method: 'PATCH',
        body: settings,
      })
      await refreshAfterMutation({ includeAdmin: true, includeSession: false })
    } catch (error) {
      showAppError(error)
    }
  }

  const handleUpdateSpinReward = async (rewardId, updates) => {
    try {
      await apiRequest(`/api/spin/rewards/${rewardId}`, {
        method: 'PATCH',
        body: updates,
      })
      await refreshAfterMutation({ includeAdmin: true, includeSession: false })
    } catch (error) {
      showAppError(error)
    }
  }

  const handleSendNotification = async (payload) => {
    try {
      await apiRequest('/api/notifications', {
        method: 'POST',
        body: payload,
      })
      await refreshNotifications()
    } catch (error) {
      showAppError(error)
    }
  }

  const handleUpdateNotificationSettings = async (updates) => {
    try {
      const response = await apiRequest('/api/notifications/settings', {
        method: 'PATCH',
        body: updates,
      })
      setNotificationSettings(response.settings || notificationSettings)
    } catch (error) {
      showAppError(error)
    }
  }

  const renderPage = () => {
    const isAdmin = authUser?.role === 'admin'
    const isProtectedPath = protectedUserPaths.includes(path)

    if (!isAuthenticated && !isAuthLoading && isProtectedPath) {
      return <Login onGoSignup={() => navigate('/signup')} onLogin={handleLogin} />
    }

    if (path.startsWith('/admin') && !isAuthLoading && !isAdmin) {
      return (
        <section className="card">
          <h2>Admin access required</h2>
          <p className="muted">You do not have access to this page.</p>
        </section>
      )
    }

    switch (path) {
      case '/':
        return (
          <Home
            draws={draws}
            serverNow={serverNow}
            onEnterDraw={handleEnterDraw}
            onViewDraw={handleViewDraw}
            celebration={entryCelebration}
            onDismissCelebration={() => setEntryCelebration(null)}
            isLoading={isHomeLoading}
          />
        )
      case '/login':
        return <Login onGoSignup={() => navigate('/signup')} onLogin={handleLogin} />
      case '/signup':
        return <Signup onGoLogin={() => navigate('/login')} onSignup={handleSignup} />
      case '/dashboard':
        return (
          <Dashboard
            user={sharedUser}
            recentEntries={recentEntries}
            notificationsUnreadCount={notificationsUnreadCount}
            onNavigate={navigate}
            isLoading={isAuthLoading || isDashboardLoading}
          />
        )
      case '/wallet':
        return (
          <Wallet
            user={sharedUser}
            transactions={transactions}
            isFundingOpen={isFundingOpen}
            banks={banks}
            supportContact={SUPPORT_CONTACT}
            onFundWallet={() => setIsFundingOpen(true)}
            onCloseFunding={() => setIsFundingOpen(false)}
            onSubmitFunding={handleSubmitFunding}
          />
        )
      case '/daily-chances':
        return (
          <DailyChances
            rewards={spinSettings.rewards}
            spinCost={spinSettings.spinCost}
            spinState={spinState}
            walletBalance={walletBalance}
            onSpin={handleSpin}
            onCloseResultModal={() =>
              setSpinState((prev) => ({
                ...prev,
                showResultModal: false,
              }))
            }
            quiz={quizToday}
            quizState={quizState}
            onSubmitAnswer={handleQuizAnswer}
            isLoading={isAuthLoading || isDailyChancesLoading}
          />
        )
      case '/winners':
        return <Winners winners={winners} testimonials={testimonials} />
      case '/notifications':
        return <Notifications notifications={notifications} />
      case '/terms':
        return <LegalPage title="Terms & Conditions" variant="terms" />
      case '/privacy':
        return <LegalPage title="Privacy Policy" variant="privacy" />
      case '/rules':
        return <LegalPage title="Rules" variant="rules" />
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
              draws: adminOverview.activeDraws,
              pendingDeposits: adminOverview.pendingDeposits,
              todaysQuiz: quizToday ? 'Published' : 'Pending',
              totalUsers: adminOverview.totalUsers,
            }}
            participants={adminParticipants}
            draws={adminDraws}
            referrals={adminReferrals}
            serverNow={serverNow}
            onUpdateDraw={handleUpdateDraw}
            onStatusChange={handleDrawStatusOverride}
            onCloseDraw={handleCloseDraw}
            onDeleteDraw={handleDeleteDraw}
            isLoading={isAuthLoading || isAdminOverviewLoading}
          />
        )
      case '/admin/create-draw':
        return <AdminCreateDraw draws={adminDraws} onCreateDraw={handleCreateDraw} />
      case '/admin/participants':
        return <AdminParticipants participants={adminParticipants} />
      case '/admin/deposits':
        return (
          <AdminDeposits
            deposits={depositRequests}
            onApprove={handleApproveDeposit}
            onReject={handleRejectDeposit}
          />
        )
      case '/admin/wallet-stats':
        return <AdminWalletStats stats={walletStats} transactions={walletStats.transactions} />
      case '/admin/spin-settings':
        return (
          <AdminSpinSettings
            spinSettings={spinSettings}
            onSaveSettings={handleUpdateSpinSettings}
            onSaveReward={handleUpdateSpinReward}
          />
        )
      case '/admin/banks':
        return (
          <AdminBanks
            banks={banks}
            onAddBank={handleAddBank}
            onUpdateBank={handleUpdateBank}
            onRemoveBank={handleRemoveBank}
          />
        )
      case '/admin/winners':
        return (
          <AdminWinners
            winners={winners.map((winner) => ({
              referenceId: winner.referenceId,
              prize: winner.prizeTitle,
              date: winner.date,
            }))}
          />
        )
      case '/admin/quiz':
        return (
          <AdminQuiz
            scheduledQuizzes={scheduledQuizzes}
            onCreateQuiz={handleCreateQuiz}
            onUpdateQuiz={handleUpdateQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onPublishQuiz={handlePublishQuiz}
          />
        )
      case '/admin/notifications':
        return (
          <AdminNotifications
            settings={notificationSettings}
            notifications={notifications}
            onSendNotification={handleSendNotification}
            onUpdateSettings={handleUpdateNotificationSettings}
          />
        )
      case '/admin/users':
        return (
          <AdminUsers
            users={adminUsers}
            onViewUser={(userId) => navigate(`/admin/users/${userId}`)}
            onBanToggle={handleBanToggle}
            onRoleChange={handleRoleChange}
          />
        )
      default:
        if (path.startsWith('/admin/users/')) {
          return (
            <AdminUserDetail
              user={adminUserDetail?.user}
              history={adminUserDetail?.history}
              isLoading={isAdminUserLoading}
              errorMessage={adminUserDetailError}
              onBanToggle={handleBanToggle}
              onRoleChange={handleRoleChange}
              onAdjustWallet={handleAdjustWallet}
            />
          )
        }

        return (
          <Home
            draws={draws}
            serverNow={serverNow}
            onViewDraw={handleViewDraw}
            onEnterDraw={handleEnterDraw}
            celebration={entryCelebration}
            onDismissCelebration={() => setEntryCelebration(null)}
            isLoading={isHomeLoading}
          />
        )
    }
  }

  const isAdminRoute = (path === '/admin' || path.startsWith('/admin/')) && authUser?.role === 'admin'

  return (
    <div className="app-shell">
      <Navbar
        currentPath={path}
        onNavigate={navigate}
        onOpenInfo={openInfoModal}
        notifications={notifications}
        notificationsUnreadCount={notificationsUnreadCount}
        isNotificationsOpen={isNotificationsOpen}
        isNotificationsLoading={isNotificationsLoading}
        onToggleNotifications={handleToggleNotifications}
        isAuthenticated={isAuthenticated}
        isAuthLoading={isAuthLoading}
        onLogout={handleLogout}
      />
      <main className="page-container">
        {appFeedback ? (
          <section className={`card feedback-banner feedback-banner-${appFeedback.type}`}>
            <div className="row spread">
              <p>{appFeedback.message}</p>
              <button type="button" className="text-link" onClick={() => setAppFeedback(null)}>
                Dismiss
              </button>
            </div>
          </section>
        ) : null}
        {isAdminRoute ? (
          <div className="admin-layout">
            <AdminSidebar currentPath={path} onNavigate={navigate} />
            <section className="admin-content">{renderPage()}</section>
          </div>
        ) : (
          renderPage()
        )}
      </main>
      <SiteFooter onNavigate={navigate} />
      <button type="button" className="floating-install-btn" onClick={() => setIsInstallOpen(true)}>
        Install
      </button>
      <button type="button" className="floating-info-btn" onClick={openInfoModal}>
        Info
      </button>
      <EntryModal
        draw={entryDraw}
        walletBalance={walletBalance}
        onClose={() => setEntryDraw(null)}
        onConfirm={handleConfirmEntry}
        onFundWallet={() => navigate('/wallet')}
      />
      <DrawDetailsModal
        draw={selectedDrawDetails}
        serverNow={serverNow}
        onClose={() => setSelectedDrawDetails(null)}
        onEnterDraw={handleEnterDraw}
      />
      <InfoModal isOpen={isInfoOpen} onClose={closeInfoModal} />
      <InstallPromptModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        onInstall={handleInstallApp}
        canInstall={Boolean(deferredInstallPrompt)}
      />
    </div>
  )
}

export default App
