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
import AboutPage from './pages/AboutPage'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import SignupSuccess from './pages/SignupSuccess'
import VerificationSuccess from './pages/VerificationSuccess'
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
import AdminTestimonials from './pages/AdminTestimonials'
import LegalPage from './pages/LegalPage'
import { API_BASE_URL, apiRequest } from './utils/api'
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
  enteredDrawPrizeIds: [],
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
  canSpin: true,
  dailySpinLimit: 1,
  paidSpinsUsed: 0,
  availableFreeSpins: 0,
  remainingTotalSpins: 1,
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

const protectedUserPaths = ['/dashboard', '/wallet', '/notifications', '/testimonials']

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

const mapManagedDrawForHome = (draw) => ({
  id: draw.id,
  drawId: draw.drawId,
  drawPrizeId: draw.id,
  slotNumber: draw.slotNumber,
  title: draw.title,
  description: draw.description || '',
  image: draw.image || draw.imageUrl || draw.images?.[0] || '',
  coverImage: draw.image || draw.imageUrl || draw.images?.[0] || '',
  images: draw.images || [],
  entryFee: Number(draw.entryFee || 0),
  prizeValue: Number(draw.prizeValue || 0),
  status: draw.status,
  currentEntries: draw.currentEntries || 0,
  maxEntries: draw.maxEntries || 0,
  winnerCount: Number(draw.winnerCount || 1),
  startTime: draw.startTime,
  endTime: draw.endTime,
  drawRef: draw.drawRef,
  drawDay: draw.drawDay,
  goLiveMode: draw.goLiveMode,
  hasEntered: Boolean(draw.hasEntered),
})

function App() {
  const spinTimeoutRef = useRef(null)
  const spinIntervalRef = useRef(null)
  const spinRotationRef = useRef(0)
  const installPromptTimerRef = useRef(null)
  const hasLoadedInitialHomeRef = useRef(false)
  const hasSkippedInitialHomeNavRefreshRef = useRef(false)
  const dashboardSnapshotAtRef = useRef(0)
  const hasDailyChancesSnapshotRef = useRef(false)
  const dailyChancesSnapshotAtRef = useRef(0)
  const publicDataRequestRef = useRef(null)
  const sessionRefreshPromiseRef = useRef(null)
  const focusRefreshRef = useRef({ lastRunAt: 0 })
  const [path, setPath] = useState(window.location.pathname || '/')
  const [serverNow, setServerNow] = useState(Date.now())
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isResendingVerificationBanner, setIsResendingVerificationBanner] = useState(false)
  const [authUser, setAuthUser] = useState(null)
  const [hasConfirmedVerifiedEmail, setHasConfirmedVerifiedEmail] = useState(false)
  const [appFeedback, setAppFeedback] = useState(null)
  const [serviceDegradedMessage, setServiceDegradedMessage] = useState('')
  const [isHomeLoading, setIsHomeLoading] = useState(true)
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)
  const [isDailyChancesLoading, setIsDailyChancesLoading] = useState(false)
  const [isAdminOverviewLoading, setIsAdminOverviewLoading] = useState(false)
  const [draws, setDraws] = useState([])
  const [winners, setWinners] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [banks, setBanks] = useState([])
  const [isBanksLoading, setIsBanksLoading] = useState(false)
  const [banksError, setBanksError] = useState('')
  const [dashboardData, setDashboardData] = useState(emptyDashboard)
  const [transactions, setTransactions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notificationsUnreadCount, setNotificationsUnreadCount] = useState(0)
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)
  const [isNotificationsLoadingMore, setIsNotificationsLoadingMore] = useState(false)
  const [notificationsHasMore, setNotificationsHasMore] = useState(false)
  const [depositRequests, setDepositRequests] = useState([])
  const [isFundingOpen, setIsFundingOpen] = useState(false)
  const [entryDraw, setEntryDraw] = useState(null)
  const [selectedDrawDetails, setSelectedDrawDetails] = useState(null)
  const [entryCelebration, setEntryCelebration] = useState(null)
  const [winnerCelebration, setWinnerCelebration] = useState(null)
  const [testimonialViewer, setTestimonialViewer] = useState(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isInstallOpen, setIsInstallOpen] = useState(false)
  const [isAppInstalled, setIsAppInstalled] = useState(false)
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
    settings: {
      isActive: true,
      rewardAmount: 500,
    },
    totalReferredUsers: 0,
    latestRelationships: [],
  })
  const [adminUsers, setAdminUsers] = useState([])
  const [adminUserDetail, setAdminUserDetail] = useState(null)
  const [isAdminUserLoading, setIsAdminUserLoading] = useState(false)
  const [adminUserDetailError, setAdminUserDetailError] = useState('')
  const [walletStats, setWalletStats] = useState(emptyWalletStats)
  const [scheduledQuizzes, setScheduledQuizzes] = useState([])
  const [pendingDrawWinners, setPendingDrawWinners] = useState([])
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
      if (spinIntervalRef.current) {
        window.clearInterval(spinIntervalRef.current)
      }
      if (installPromptTimerRef.current) {
        window.clearTimeout(installPromptTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    spinRotationRef.current = spinState.rotation
  }, [spinState.rotation])

  useEffect(() => {
    const hasSeenInfo = window.localStorage.getItem('vq-info-seen')
    if (hasSeenInfo) return

    const timerId = window.setTimeout(() => {
      setIsInfoOpen(true)
    }, 5_000)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [])

  useEffect(() => {
    if (!dashboardData.winnerNotice?.winnerId) return

    const celebrationKey = `vq-winner-celebrated-${dashboardData.winnerNotice.winnerId}`
    if (window.localStorage.getItem(celebrationKey)) {
      return
    }

    // Winner celebrations fire once per browser storage state so actual
    // winners get a strong first-login moment without being interrupted on
    // every navigation afterwards.
    window.localStorage.setItem(celebrationKey, 'true')
    setWinnerCelebration({
      title: dashboardData.winnerNotice.prizeTitle,
      referenceId: dashboardData.winnerNotice.referenceId,
      slotNumber: dashboardData.winnerNotice.slotNumber,
    })
  }, [dashboardData.winnerNotice])

  useEffect(() => {
    const detectInstalled = () => {
      const installed =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      setIsAppInstalled(installed)
    }

    detectInstalled()
    const media = window.matchMedia('(display-mode: standalone)')
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredInstallPrompt(event)
    }

    const onInstalled = () => {
      setIsAppInstalled(true)
      setDeferredInstallPrompt(null)
      setIsInstallOpen(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    media.addEventListener?.('change', detectInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      media.removeEventListener?.('change', detectInstalled)
    }
  }, [])

  const markInstallPromptSeen = useCallback(() => {
    window.localStorage.setItem('vq-install-prompt-dismissed', 'true')
  }, [])

  useEffect(() => {
    if (isAppInstalled) {
      return
    }

    const dismissed = window.localStorage.getItem('vq-install-prompt-dismissed') === 'true'

    if (dismissed || installPromptTimerRef.current) {
      return
    }

    // The install helper is stored locally only. Once dismissed, it stays
    // hidden until browser storage is cleared on that device.
    installPromptTimerRef.current = window.setTimeout(() => {
      markInstallPromptSeen()
      setIsInstallOpen(true)
      installPromptTimerRef.current = null
    }, 15_000)

    return () => {
      if (installPromptTimerRef.current) {
        window.clearTimeout(installPromptTimerRef.current)
        installPromptTimerRef.current = null
      }
    }
  }, [isAppInstalled, markInstallPromptSeen])

  const navigate = (nextPath) => {
    if (nextPath === path) return
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
    setIsNotificationsOpen(false)
    setAppFeedback(null)
  }

  const isTemporaryServiceMessage = useCallback(
    (message) => typeof message === 'string' && /service is temporarily unavailable/i.test(message),
    [],
  )

  const noteServiceDegraded = useCallback((message) => {
    if (!message || !isTemporaryServiceMessage(message)) return
    setServiceDegradedMessage(message)
  }, [isTemporaryServiceMessage])

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
    markInstallPromptSeen()
    setDeferredInstallPrompt(null)
    setIsInstallOpen(false)
  }

  const showAppError = useCallback((error, fallbackMessage = 'Something went wrong. Please try again.') => {
    const message = error instanceof Error ? error.message : fallbackMessage
    noteServiceDegraded(message)
    setAppFeedback({
      type: 'error',
      message,
    })
  }, [noteServiceDegraded]) 

  const applyHomeSnapshot = useCallback((payload) => {
    const heroDraws = payload?.critical?.heroDraws || []
    setDraws(
      heroDraws.map((draw) => ({
        ...draw,
        drawRef: draw.drawRef,
        image: draw.coverImage,
        status: draw.status,
        winners: mapWinners(draw.winners || []),
        winnerCount: Number(draw.winnerCount || 0),
        winnerReferenceIds: draw.winnerReferenceIds || [],
        winnerReferenceId: draw.winnerReferenceId || null,
      })),
    )
    setServerNow(payload?.serverNow ? new Date(payload.serverNow).getTime() : Date.now())
    const latestWinners = payload?.critical?.latestWinners || payload?.secondary?.winnersPreview || []
    setWinners(mapWinners(latestWinners))
  }, [])

  const syncManagedDrawLocally = useCallback((drawPayload) => {
    // Mutations update the draw lists immediately so create/update/delete
    // actions do not depend on a later navigation or stale cached response.
    const [nextManagedDraw] = flattenDraws([drawPayload])
    if (!nextManagedDraw) {
      throw new Error('The draw was saved but no draw payload was returned.')
    }

    setAdminDraws((prev) => {
      const otherDraws = prev.filter((item) => item.id !== nextManagedDraw.id && item.slotNumber !== nextManagedDraw.slotNumber)
      return [...otherDraws, nextManagedDraw].sort((left, right) => {
        if (left.slotNumber !== right.slotNumber) return left.slotNumber - right.slotNumber
        return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
      })
    })

    setDraws((prev) => {
      const nextPublicDraw = mapManagedDrawForHome(nextManagedDraw)
      const isEligibleForHome =
        Boolean(nextPublicDraw.image) &&
        nextPublicDraw.status !== 'deleted'

      const withoutSlot = prev.filter((item) => item.slotNumber !== nextPublicDraw.slotNumber && item.id !== nextPublicDraw.id)
      if (!isEligibleForHome) {
        return withoutSlot
      }

      return [...withoutSlot, nextPublicDraw].sort((left, right) => left.slotNumber - right.slotNumber)
    })

    return nextManagedDraw
  }, [])

  const removeManagedDrawLocally = useCallback((drawId) => {
    setAdminDraws((prev) => prev.filter((item) => item.id !== drawId))
    setDraws((prev) => prev.filter((item) => item.id !== drawId))
  }, [])

  const loadPublicData = useCallback(async ({ showLoader = true } = {}) => {
    if (publicDataRequestRef.current) {
      return publicDataRequestRef.current
    }

    if (showLoader) {
      setIsHomeLoading(true)
    }

    const request = (async () => {
      try {
        const payload = await apiRequest('/api/app/home')
        applyHomeSnapshot(payload)
        setServiceDegradedMessage('')
        return payload
      } catch (error) {
        noteServiceDegraded(error instanceof Error ? error.message : '')
        throw error
      } finally {
        hasLoadedInitialHomeRef.current = true
        if (showLoader) {
          setIsHomeLoading(false)
        }
        publicDataRequestRef.current = null
      }
    })()

    publicDataRequestRef.current = request
    return request
  }, [applyHomeSnapshot, noteServiceDegraded])

  const clearAuthenticatedState = useCallback(() => {
    dashboardSnapshotAtRef.current = 0
    hasDailyChancesSnapshotRef.current = false
    dailyChancesSnapshotAtRef.current = 0
    setIsAuthenticated(false)
    setAuthUser(null)
    setHasConfirmedVerifiedEmail(false)
    setDashboardData(emptyDashboard)
    setTransactions([])
    setNotifications([])
    setNotificationsUnreadCount(0)
    setNotificationsHasMore(false)
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
      settings: {
        isActive: true,
        rewardAmount: 500,
      },
      totalReferredUsers: 0,
      latestRelationships: [],
    })
    setAdminUsers([])
    setAdminUserDetail(null)
    setIsAdminUserLoading(false)
    setAdminUserDetailError('')
    setWalletStats(emptyWalletStats)
    setScheduledQuizzes([])
    setPendingDrawWinners([])
    setSpinState((prev) => ({
      ...emptySpinState,
      rotation: prev.rotation,
    }))
    setQuizState(emptyQuizState)
  }, [])

  const getSessionProfile = useCallback(async () => {
    // A lightweight profile check avoids loading the full dashboard payload
    // when the browser has no active session cookie.
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      credentials: 'include',
      cache: 'no-store',
    })

    if (response.status === 401 || response.status === 403) {
      return null
    }

    if (!response.ok) {
      const payload = await response.text().catch(() => '')
      throw new Error(payload || 'We could not confirm your session right now.')
    }

    return response.json()
  }, [])

  const applyDashboardSnapshot = useCallback((dashboardResponse) => {
    const critical = dashboardResponse?.critical || {}
    const secondary = dashboardResponse?.secondary || {}

    setDashboardData({
      user: critical.user
        ? {
            id: critical.user.id,
            name: critical.user.fullName,
            email: critical.user.email || '',
            referenceId: critical.user.referenceId,
            role: critical.user.role,
            emailVerified: Boolean(critical.user.emailVerified),
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
      enteredDrawPrizeIds: critical.enteredDrawPrizeIds || [],
      latestNotifications: critical.notifications?.latest || [],
      winnerNotice: critical.winnerNotice || null,
      referralSummary: {
        isActive: Boolean(critical.referrals?.isActive ?? true),
        rewardAmount: Number(critical.referrals?.rewardAmount || 500),
        referralCode: critical.referrals?.code || critical.user?.referenceId || 'PENDING_REF',
        totalReferrals: Number(critical.referrals?.total || 0),
        successfulReferrals: Number(critical.referrals?.successful || 0),
        totalRewardsEarned: Number(critical.referrals?.earned || 0),
        recentActivity: secondary.referralActivity || [],
      },
    })
    if (critical.user?.emailVerified) {
      setHasConfirmedVerifiedEmail(true)
    }
    setTransactions(mapTransactions(secondary.recentTransactions || []))
    setNotificationsUnreadCount(Number(critical.notifications?.unreadCount || 0))
    setNotificationsHasMore(false)
    if ((critical.notifications?.latest || []).length) {
      setNotifications(mapNotifications(critical.notifications.latest))
    }
    dashboardSnapshotAtRef.current = Date.now()
    setSpinState((prev) => ({
      ...prev,
      hasSpunToday: Boolean(critical.spinStatus?.hasSpunToday),
      canSpin: Boolean(critical.spinStatus?.canSpin),
      dailySpinLimit: Number(critical.spinStatus?.dailySpinLimit || prev.dailySpinLimit || 1),
      paidSpinsUsed: Number(critical.spinStatus?.paidSpinsUsed || 0),
      availableFreeSpins: Number(critical.spinStatus?.availableFreeSpins || 0),
      remainingTotalSpins: Number(critical.spinStatus?.remainingTotalSpins || 0),
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
          settings: {
            isActive: true,
            rewardAmount: 500,
          },
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

    if (targetPath === '/admin/winners') {
      requests.push(apiRequest('/api/admin/draw-winners/pending'))
      applyResult.push((pendingWinnersResponse) => {
        if (pendingWinnersResponse) {
          setPendingDrawWinners(mapWinners(pendingWinnersResponse.pending || []))
        }
      })
    }

    if (targetPath === '/admin/testimonials') {
      requests.push(apiRequest('/api/testimonials'))
      applyResult.push((testimonialsResponse) => {
        if (testimonialsResponse) {
          setTestimonials(mapTestimonials(testimonialsResponse.testimonials || []))
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

  const applyDailyChancesSnapshot = useCallback((payload, { includeWalletBalance = true } = {}) => {
    const critical = payload?.critical || {}

    setSpinSettings((prev) => ({
      ...prev,
      spinCost: Number(critical.spin?.spinCost || prev.spinCost),
      dailySpinLimit: Number(critical.spin?.dailySpinLimit || prev.dailySpinLimit || 1),
      rewards: (critical.spin?.rewards || []).map((reward) => ({
        id: reward.id,
        label: reward.label,
        rewardType: reward.rewardType,
        type: reward.rewardType,
        rewardAmount: Number(reward.rewardAmount || 0),
        amount: Number(reward.rewardAmount || 0),
      })),
    }))
    setSpinState((prev) => ({
      ...prev,
      hasSpunToday: Boolean(critical.spin?.hasSpunToday),
      canSpin: Boolean(critical.spin?.canSpin),
      dailySpinLimit: Number(critical.spin?.dailySpinLimit || prev.dailySpinLimit || 1),
      paidSpinsUsed: Number(critical.spin?.paidSpinsUsed || 0),
      availableFreeSpins: Number(critical.spin?.availableFreeSpins || 0),
      remainingTotalSpins: Number(critical.spin?.remainingTotalSpins || 0),
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

    if (includeWalletBalance) {
      setDashboardData((prev) => ({
        ...prev,
        wallet: {
          balance: Number(critical.walletBalance || prev.wallet?.balance || 0),
        },
      }))
    }

    hasDailyChancesSnapshotRef.current = true
    dailyChancesSnapshotAtRef.current = Date.now()
  }, [])

  const loadAuthenticatedData = useCallback(async ({ includeDailyChancesSnapshot = false } = {}) => {
    const [dashboardResponse, dailyChancesResponse] = await Promise.all([
      apiRequest('/api/app/dashboard'),
      includeDailyChancesSnapshot ? apiRequest('/api/app/daily-chances') : Promise.resolve(null),
    ])
    if (!dashboardResponse?.critical?.user) {
      throw new Error('We could not load your dashboard right now. Please try again.')
    }

    applyDashboardSnapshot(dashboardResponse)
    if (dailyChancesResponse) {
      applyDailyChancesSnapshot(dailyChancesResponse, { includeWalletBalance: true })
    }
    const user = {
      id: dashboardResponse.critical.user.id,
      name: dashboardResponse.critical.user.fullName,
      email: dashboardResponse.critical.user.email || '',
      referenceId: dashboardResponse.critical.user.referenceId,
      role: normalizeRole(dashboardResponse.critical.user.role),
      emailVerified: Boolean(dashboardResponse.critical.user.emailVerified),
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
        settings: {
          isActive: true,
          rewardAmount: 500,
        },
        totalReferredUsers: 0,
        latestRelationships: [],
      })
      setAdminUsers([])
      setAdminUserDetail(null)
      setWalletStats(emptyWalletStats)
      setScheduledQuizzes([])
    }
    setServiceDegradedMessage('')
  }, [applyDashboardSnapshot, applyDailyChancesSnapshot])

  // Only switch the shell into the authenticated state after user-scoped
  // data is ready, so the navbar and protected routes update together.
  const refreshSession = useCallback(async ({ showLoader = true, includeDailyChancesSnapshot = false } = {}) => {
    if (sessionRefreshPromiseRef.current) {
      return sessionRefreshPromiseRef.current
    }

    if (showLoader) {
      setIsAuthLoading(true)
    }
    const request = (async () => {
      try {
        const profileResponse = await getSessionProfile()
        if (!profileResponse?.user) {
          clearAuthenticatedState()
          setAppFeedback(null)
          return null
        }

        if (showLoader) {
          setIsDashboardLoading(true)
        }
        await loadAuthenticatedData({ includeDailyChancesSnapshot })
        setAppFeedback(null)
      } catch (error) {
        noteServiceDegraded(error instanceof Error ? error.message : '')
        clearAuthenticatedState()
      } finally {
        setIsDashboardLoading(false)
        if (showLoader) {
          setIsAuthLoading(false)
        }
        sessionRefreshPromiseRef.current = null
      }
    })()

    sessionRefreshPromiseRef.current = request
    return request
  }, [clearAuthenticatedState, getSessionProfile, loadAuthenticatedData, noteServiceDegraded])

  const refreshAppData = useCallback(async () => {
    await Promise.allSettled([
      loadPublicData({ showLoader: true }).catch((error) => {
        console.error(error)
      }),
      refreshSession({ showLoader: true, includeDailyChancesSnapshot: true }),
    ])
  }, [loadPublicData, refreshSession])

  const refreshNotifications = useCallback(async ({ append = false } = {}) => {
    if (!isAuthenticated) return

    if (append) {
      setIsNotificationsLoadingMore(true)
    } else {
      setIsNotificationsLoading(true)
    }
    try {
      const offset = append ? notifications.length : 0
      const notificationsResponse = await apiRequest(`/api/notifications?limit=15&offset=${offset}`)
      const nextNotifications = mapNotifications(notificationsResponse.notifications || notificationsResponse)
      setNotifications((prev) => (append ? [...prev, ...nextNotifications] : nextNotifications))
      setNotificationsUnreadCount(
        Number(
          notificationsResponse.unreadCount ??
            (append ? notificationsUnreadCount : nextNotifications.filter((item) => !item.isRead).length),
        ),
      )
      setNotificationsHasMore(Boolean(notificationsResponse.hasMore))
    } finally {
      if (append) {
        setIsNotificationsLoadingMore(false)
      } else {
        setIsNotificationsLoading(false)
      }
    }
  }, [isAuthenticated, notifications.length, notificationsUnreadCount])

  const loadMoreNotifications = useCallback(async () => {
    if (!isAuthenticated || isNotificationsLoadingMore || !notificationsHasMore) return
    await refreshNotifications({ append: true })
  }, [isAuthenticated, isNotificationsLoadingMore, notificationsHasMore, refreshNotifications])

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

  const refreshDashboardSnapshot = useCallback(async ({ force = false } = {}) => {
    if (!isAuthenticated) return

    const snapshotAge = Date.now() - dashboardSnapshotAtRef.current
    if (!force && dashboardSnapshotAtRef.current > 0 && snapshotAge < 45_000) {
      return
    }

    const dashboardResponse = await apiRequest('/api/app/dashboard')
    applyDashboardSnapshot(dashboardResponse)
  }, [applyDashboardSnapshot, isAuthenticated])

  const refreshDailyChancesSnapshot = useCallback(async ({ showLoader = true, force = false } = {}) => {
    const snapshotAge = Date.now() - dailyChancesSnapshotAtRef.current
    if (!force && hasDailyChancesSnapshotRef.current && snapshotAge < 60_000) {
      return
    }

    if (showLoader) {
      setIsDailyChancesLoading(true)
    }

    try {
      if (!isAuthenticated) {
        const [spinConfig, quizPayload] = await Promise.all([
          apiRequest('/api/spin/config'),
          apiRequest('/api/quiz/today'),
        ])

        const mappedSpinConfig = mapSpinSettings(spinConfig)
        setSpinSettings((prev) => ({
          ...prev,
          ...mappedSpinConfig,
        }))
        setSpinState((prev) => ({
          ...prev,
          canSpin: true,
          hasSpunToday: false,
          paidSpinsUsed: 0,
          availableFreeSpins: 0,
          remainingTotalSpins: 1,
        }))
        setQuizToday(quizPayload?.quiz || null)
        setQuizState(emptyQuizState)
        hasDailyChancesSnapshotRef.current = true
        dailyChancesSnapshotAtRef.current = Date.now()
        return
      }

      const payload = await apiRequest('/api/app/daily-chances')
      applyDailyChancesSnapshot(payload, { includeWalletBalance: true })
    } finally {
      if (showLoader) {
        setIsDailyChancesLoading(false)
      }
    }
  }, [applyDailyChancesSnapshot, isAuthenticated])

  const refreshAfterMutation = useCallback(async ({ includeAdmin = false, includeSession = true } = {}) => {
    const tasks = [
      loadPublicData({ showLoader: false }).catch((error) => {
        console.error(error)
      }),
    ]

    if (includeSession && isAuthenticated) {
      tasks.push(
        refreshDashboardSnapshot({ force: true }).catch((error) => {
          console.error(error)
        }),
      )

      if (path === '/daily-chances') {
        tasks.push(
          refreshDailyChancesSnapshot({ showLoader: false, force: true }).catch((error) => {
            console.error(error)
          }),
        )
      }
    }

    if (includeAdmin && authUser?.role === 'admin') {
      tasks.push(loadAdminData())
    }

    await Promise.allSettled(tasks)
  }, [authUser?.role, isAuthenticated, loadAdminData, loadPublicData, path, refreshDashboardSnapshot, refreshDailyChancesSnapshot])

  const refreshBanks = useCallback(async () => {
    setIsBanksLoading(true)
    setBanksError('')
    try {
      const banksResponse = await apiRequest('/api/banks')
      const nextBanks = mapBanks(banksResponse.banks || banksResponse)
      setBanks(nextBanks)

      if (!nextBanks.length) {
        setBanksError('Funding bank accounts are being updated. Please check back shortly.')
      }
    } catch (error) {
      setBanksError(error instanceof Error ? error.message : 'We could not load the funding bank accounts.')
      throw error
    } finally {
      setIsBanksLoading(false)
    }
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
    if (!hasLoadedInitialHomeRef.current) return
    if (!hasSkippedInitialHomeNavRefreshRef.current) {
      hasSkippedInitialHomeNavRefreshRef.current = true
      return
    }

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
    if (isAuthLoading || isAuthenticated) return
    if (!protectedUserPaths.includes(path)) return
    if (path === '/login') return

    window.history.replaceState({}, '', '/login')
    setPath('/login')
  }, [isAuthLoading, isAuthenticated, path])

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

    const snapshotAge = Date.now() - dashboardSnapshotAtRef.current
    if (dashboardSnapshotAtRef.current > 0 && snapshotAge < 60_000) {
      return
    }

    // Refresh dashboard-specific data only when the snapshot is stale so we
    // avoid repeated user/profile checks during normal navigation.
    void refreshDashboardSnapshot().catch((error) => {
      console.error(error)
    })
  }, [isAuthLoading, isAuthenticated, path, refreshDashboardSnapshot])

  useEffect(() => {
    if (path !== '/daily-chances') return

    const showLoader = !hasDailyChancesSnapshotRef.current
    void refreshDailyChancesSnapshot({ showLoader }).catch((error) => {
      console.error(error)
    })
  }, [path, refreshDailyChancesSnapshot])

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
    if (banks.length || banksError || isBanksLoading) return

    void refreshBanks().catch((error) => {
      console.error(error)
    })
  }, [banks.length, banksError, isBanksLoading, isFundingOpen, path, refreshBanks])

  useEffect(() => {
    const needsWinnerData = path === '/winners' || path === '/testimonials' || path === '/about' || path === '/admin/winners'
    if (!needsWinnerData) return

    // Winners/testimonials pages should refresh on navigation so new winner
    // announcements and new proof uploads appear without a browser reload.
    void refreshWinnersAndTestimonials().catch((error) => {
      console.error(error)
    })
  }, [path, refreshWinnersAndTestimonials])

  useEffect(() => {
    if (!isAuthenticated) return

    const handleFocusRefresh = () => {
      const now = Date.now()
      if (now - focusRefreshRef.current.lastRunAt < 20_000) {
        return
      }
      focusRefreshRef.current.lastRunAt = now

      if (protectedUserPaths.includes(path)) {
        void refreshDashboardSnapshot().catch((error) => {
          console.error(error)
        })
      }

      if (path === '/daily-chances') {
        void refreshDailyChancesSnapshot({ showLoader: false }).catch((error) => {
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
          isActive: true,
          rewardAmount: 500,
          referralCode: 'VQ---',
          totalReferrals: 0,
          successfulReferrals: 0,
          totalRewardsEarned: 0,
          recentActivity: [],
        },
        winnerNotice: null,
        enteredDrawPrizeIds: [],
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
        isActive: true,
        rewardAmount: 500,
        referralCode: dashboardData.user.referenceId || 'PENDING_REF',
        totalReferrals: 0,
        successfulReferrals: 0,
        totalRewardsEarned: 0,
        recentActivity: [],
      },
      winnerNotice: dashboardData.winnerNotice || null,
      enteredDrawPrizeIds: dashboardData.enteredDrawPrizeIds || [],
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

  const enteredDrawPrizeIds = useMemo(
    () => new Set(sharedUser.enteredDrawPrizeIds || []),
    [sharedUser.enteredDrawPrizeIds],
  )

  const testimonialAccess = useMemo(() => {
    const submittedCount = testimonials.filter((item) => item.userId === sharedUser.userId).length
    const canViewSubmission = sharedUser.wins > 0

    return {
      canViewSubmission,
      canSubmit: canViewSubmission && submittedCount < sharedUser.wins,
      submittedCount,
    }
  }, [sharedUser.userId, sharedUser.wins, testimonials])

  const visibleDraws = useMemo(
    () =>
      draws.map((draw) => ({
        ...draw,
        hasEntered: enteredDrawPrizeIds.has(draw.drawPrizeId),
      })),
    [draws, enteredDrawPrizeIds],
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
    const loginResponse = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: {
        ...formState,
        callbackURL: `${window.location.origin}/email-verified`,
      },
    })

    const loginUser = loginResponse?.user
      ? {
          id: loginResponse.user.id || '',
          name: loginResponse.user.name || formState.email,
          email: loginResponse.user.email || formState.email,
          referenceId: loginResponse.user.referenceId || 'PENDING_REF',
          role: normalizeRole(loginResponse.user.role),
          emailVerified: Boolean(loginResponse.user.emailVerified),
        }
      : {
          id: '',
          name: formState.email,
          email: formState.email,
          referenceId: 'PENDING_REF',
          role: 'user',
          emailVerified: false,
        }

    // Optimistic auth transition keeps the navbar and route state responsive
    // the moment credentials are accepted, while full dashboard hydration
    // continues in the background.
    setAuthUser(loginUser)
    setIsAuthenticated(true)
    if (loginUser.emailVerified) {
      setHasConfirmedVerifiedEmail(true)
    }
    setIsAuthLoading(false)
    navigate('/dashboard')
    void refreshSession({ showLoader: false, includeDailyChancesSnapshot: true }).catch((error) => {
      console.error(error)
    })
  }

  const handleSignup = async (formState) => {
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        ...formState,
        callbackURL: `${window.location.origin}/email-verified`,
      },
    })
    setAppFeedback(null)
    navigate('/signup-success')
  }

  const handleForgotPassword = async ({ email, redirectTo }) => {
    await apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: { email, redirectTo },
    })
  }

  const handleResetPassword = async ({ token, newPassword }) => {
    await apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
    })
  }

  const handleResendVerification = async (email) => {
    await apiRequest('/api/auth/resend-verification', {
      method: 'POST',
      body: {
        email,
        callbackURL: `${window.location.origin}/email-verified`,
      },
    })
  }

  // Once verified in-session, keep this truthy locally to prevent banner flicker
  // during background data refreshes.
  const isEmailVerified = Boolean(authUser?.emailVerified || hasConfirmedVerifiedEmail)

  const ensureVerifiedParticipation = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return false
    }

    if (isEmailVerified) {
      return true
    }

    showAppError(new Error('Please verify your email to participate. Use the resend link in the notice above.'))
    return false
  }, [isAuthenticated, isEmailVerified, navigate, showAppError])

  const handleResendVerificationFromBanner = async () => {
    if (!authUser?.email || isResendingVerificationBanner) return

    setIsResendingVerificationBanner(true)
    try {
      await handleResendVerification(authUser.email)
      setAppFeedback({
        type: 'success',
        message: 'Verification email sent. Please check your inbox and spam folder.',
      })
    } catch (error) {
      showAppError(error, 'We could not resend the verification email right now. Please retry.')
    } finally {
      setIsResendingVerificationBanner(false)
    }
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    const hadAuthenticatedSession = isAuthenticated

    // Clear local auth state first so logout feels instant in the UI.
    clearAuthenticatedState()
    setEntryDraw(null)
    setIsFundingOpen(false)
    navigate('/')
    setIsLoggingOut(false)

    void loadPublicData({ showLoader: false }).catch((error) => {
      console.error(error)
    })

    // Persist logout server-side in the background without blocking UI.
    if (hadAuthenticatedSession) {
      void apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {})
    }
  }

  const handleEnterDraw = (draw) => {
    if (!ensureVerifiedParticipation()) return

    if (!isDrawEntryOpen(draw.status)) return
    setSelectedDrawDetails(null)
    setEntryDraw(draw)
  }

  const handleViewDraw = (draw) => {
    setSelectedDrawDetails(draw)
  }

  const handleViewTestimonialImages = (testimonial, startIndex = 0) => {
    setTestimonialViewer({
      title: testimonial.prizeTitle,
      images: testimonial.images || [],
      activeIndex: startIndex,
    })
  }

  const handleCelebrateWinnerCard = (winner) => {
    setEntryCelebration({
      mode: 'winner-preview',
      title: `${winner.referenceId} won ${winner.prizeTitle}`,
      fee: 0,
      copy: 'One day this could be you.',
    })
  }

  const handleConfirmEntry = async () => {
    if (!entryDraw) return
    if (!ensureVerifiedParticipation()) return

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
      setDraws((prev) =>
        prev.map((draw) => (draw.drawPrizeId === entryDraw.drawPrizeId ? { ...draw, hasEntered: true } : draw)),
      )
      setSelectedDrawDetails((prev) =>
        prev?.drawPrizeId === entryDraw.drawPrizeId ? { ...prev, hasEntered: true } : prev,
      )
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
    if (!ensureVerifiedParticipation()) return

    if (
      !spinState.canSpin ||
      spinState.isSpinning ||
      (spinState.availableFreeSpins < 1 && walletBalance < spinSettings.spinCost) ||
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
    spinIntervalRef.current = window.setInterval(() => {
      setSpinState((prev) => ({
        ...prev,
        rotation: prev.rotation + 36,
      }))
    }, 80)

    try {
      const result = await apiRequest('/api/spin', {
        method: 'POST',
        body: {},
      })

      const segmentAngle = 360 / spinSettings.rewards.length
      const targetAngle = (360 - (result.wheelSegment * segmentAngle)) % 360
      const fullTurns = 5 * 360
      if (spinIntervalRef.current) {
        window.clearInterval(spinIntervalRef.current)
        spinIntervalRef.current = null
      }
      const currentRotation = spinRotationRef.current
      const normalizedCurrent = ((currentRotation % 360) + 360) % 360
      const deltaToTarget = (targetAngle - normalizedCurrent + 360) % 360
      const nextRotation = currentRotation + fullTurns + deltaToTarget

      window.requestAnimationFrame(() => {
        setSpinState({
          hasSpunToday: Boolean(result.spinStatus?.hasSpunToday),
          canSpin: Boolean(result.spinStatus?.canSpin),
          dailySpinLimit: Number(result.spinStatus?.dailySpinLimit || spinState.dailySpinLimit || 1),
          paidSpinsUsed: Number(result.spinStatus?.paidSpinsUsed || 0),
          availableFreeSpins: Number(result.spinStatus?.availableFreeSpins || 0),
          remainingTotalSpins: Number(result.spinStatus?.remainingTotalSpins || 0),
          isSpinning: true,
          isPriming: false,
          rotation: nextRotation,
          result: null,
          showResultModal: false,
        })
      })

      spinTimeoutRef.current = window.setTimeout(async () => {
        setSpinState({
          hasSpunToday: Boolean(result.spinStatus?.hasSpunToday),
          canSpin: Boolean(result.spinStatus?.canSpin),
          dailySpinLimit: Number(result.spinStatus?.dailySpinLimit || spinState.dailySpinLimit || 1),
          paidSpinsUsed: Number(result.spinStatus?.paidSpinsUsed || 0),
          availableFreeSpins: Number(result.spinStatus?.availableFreeSpins || 0),
          remainingTotalSpins: Number(result.spinStatus?.remainingTotalSpins || 0),
          isSpinning: false,
          isPriming: false,
          rotation: nextRotation,
          result: {
            ...result.reward,
            label: result.reward.label,
          },
          showResultModal: true,
        })
        await refreshDashboardSnapshot({ force: true })
        await refreshWalletTransactions().catch(() => {})
        spinTimeoutRef.current = null
      }, 6000)
    } catch (error) {
      if (spinIntervalRef.current) {
        window.clearInterval(spinIntervalRef.current)
        spinIntervalRef.current = null
      }
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
    if (!ensureVerifiedParticipation()) return

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
      await refreshDashboardSnapshot({ force: true })
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
      await refreshBanks()
      if (path.startsWith('/admin')) {
        await loadAdminData('/admin/banks').catch(() => {})
      }
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
      await refreshBanks()
      if (path.startsWith('/admin')) {
        await loadAdminData('/admin/banks').catch(() => {})
      }
    } catch (error) {
      showAppError(error)
    }
  }

  const handleRemoveBank = async (bankId) => {
    try {
      await apiRequest(`/api/banks/${bankId}`, {
        method: 'DELETE',
      })
      await refreshBanks()
      if (path.startsWith('/admin')) {
        await loadAdminData('/admin/banks').catch(() => {})
      }
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

      await Promise.allSettled([
        refreshAfterMutation({ includeSession: true }),
        refreshWinnersAndTestimonials(),
      ])
    } catch (error) {
      showAppError(error)
      throw error
    }
  }

  const handleUpdateTestimonial = async (testimonialId, { prizeTitle, winningDate, message, imageFiles }) => {
    try {
      const formData = new FormData()
      if (prizeTitle) {
        formData.append('prizeTitle', prizeTitle)
      }
      if (winningDate) {
        formData.append('winningDate', new Date(winningDate).toISOString())
      }
      formData.append('message', message)
      ;(imageFiles || []).forEach((image) => formData.append('images', image))

      const response = await apiRequest(`/api/testimonials/${testimonialId}`, {
        method: 'PATCH',
        body: formData,
        isFormData: true,
      })

      await Promise.allSettled([
        refreshWinnersAndTestimonials(),
        authUser?.role === 'admin' ? loadAdminData('/admin/testimonials') : Promise.resolve(),
      ])
      setAppFeedback({
        type: 'success',
        message: response?.testimonial ? 'Testimonial updated successfully.' : 'Your testimonial changes were saved.',
      })
    } catch (error) {
      showAppError(error)
      throw error
    }
  }

  const handleDeleteTestimonial = async (testimonialId) => {
    try {
      await apiRequest(`/api/testimonials/${testimonialId}`, {
        method: 'DELETE',
      })
      await Promise.allSettled([
        refreshWinnersAndTestimonials(),
        authUser?.role === 'admin' ? loadAdminData('/admin/testimonials') : Promise.resolve(),
      ])
    } catch (error) {
      showAppError(error)
      throw error
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
          winnerCount: Number(formState.winnerCount || 1),
        },
      ]),
    )

    ;(formState.imageFile || []).forEach((file) => formData.append('images', file))

    const response = await apiRequest('/api/draws', {
      method: 'POST',
      body: formData,
      isFormData: true,
    })

    const createdDraw = syncManagedDrawLocally(response.draw)
    void Promise.allSettled([
      loadPublicData(),
      authUser?.role === 'admin' ? loadAdminData('/admin/create-draw') : Promise.resolve(),
    ])
    return {
      startLabel: formatDisplayDate(createdDraw.startTime, 'Live now'),
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
    formData.append('winnerCount', String(Number(formState.winnerCount || 1)))
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

    const response = await apiRequest(`/api/draws/${drawId}`, {
      method: 'PATCH',
      body: formData,
      isFormData: true,
    })
    syncManagedDrawLocally(response.draw)
    void Promise.allSettled([
      loadPublicData(),
      authUser?.role === 'admin' ? loadAdminData(path.startsWith('/admin') ? path : '/admin') : Promise.resolve(),
    ])
  }

  const handleDeleteDraw = async (drawId) => {
    try {
      await apiRequest(`/api/draws/${drawId}`, {
        method: 'DELETE',
      })
      removeManagedDrawLocally(drawId)
      void Promise.allSettled([
        loadPublicData(),
        authUser?.role === 'admin' ? loadAdminData(path.startsWith('/admin') ? path : '/admin') : Promise.resolve(),
      ])
    } catch (error) {
      showAppError(error)
    }
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
      const response = await apiRequest('/api/spin/settings', {
        method: 'PATCH',
        body: settings,
      })
      if (response?.settings) {
        setSpinSettings(mapSpinSettings(response.settings))
        setSpinState((prev) => ({
          ...prev,
          dailySpinLimit: Number(response.settings.dailySpinLimit || prev.dailySpinLimit || 1),
        }))
      }
    } catch (error) {
      showAppError(error)
      throw error
    }
  }

  const handleUpdateSpinReward = async (rewardId, updates) => {
    try {
      const sanitizedUpdates = {
        label: typeof updates.label === 'string' ? updates.label.trim() : undefined,
        rewardType: updates.rewardType || updates.type || undefined,
        rewardAmount:
          typeof updates.rewardAmount === 'number'
            ? updates.rewardAmount
            : typeof updates.amount === 'number'
              ? updates.amount
              : undefined,
        maxDailyWinners:
          typeof updates.maxDailyWinners === 'number'
            ? updates.maxDailyWinners
            : undefined,
        isActive: typeof updates.isActive === 'boolean' ? updates.isActive : undefined,
      }
      const response = await apiRequest(`/api/spin/rewards/${rewardId}`, {
        method: 'PATCH',
        body: sanitizedUpdates,
      })
      if (response?.reward) {
        // Reward settings now return the updated row, so we keep the admin
        // screen in sync locally instead of reloading unrelated app surfaces.
        setSpinSettings((prev) => ({
          ...prev,
          rewards: prev.rewards.map((reward) =>
            reward.id === rewardId
              ? {
                  ...reward,
                  ...response.reward,
                  rewardType: response.reward.rewardType || response.reward.type,
                  type: response.reward.rewardType || response.reward.type,
                  rewardAmount: Number(response.reward.rewardAmount || response.reward.amount || 0),
                  amount: Number(response.reward.rewardAmount || response.reward.amount || 0),
                }
              : reward,
          ),
        }))
      }
    } catch (error) {
      showAppError(error)
      throw error
    }
  }

  const handleUpdateReferralSettings = async (settings) => {
    const response = await apiRequest('/api/admin/referrals/settings', {
      method: 'PATCH',
      body: settings,
    })

    const nextSettings = response?.settings || {
      isActive: true,
      rewardAmount: 500,
    }

    setAdminReferrals((prev) => ({
      ...prev,
      settings: {
        isActive: Boolean(nextSettings.isActive),
        rewardAmount: Number(nextSettings.rewardAmount || 0),
      },
    }))

    await refreshAfterMutation({ includeAdmin: true, includeSession: true })
    return nextSettings
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

  const handleAnnouncePendingWinner = async (drawId) => {
    if (!drawId) {
      showAppError(new Error('The selected draw is missing an id. Please refresh the winners page and try again.'))
      return
    }

    try {
      await apiRequest(`/api/admin/draw-winners/${drawId}/announce`, {
        method: 'POST',
        body: {},
      })
      await Promise.allSettled([
        loadPublicData(),
        refreshWinnersAndTestimonials(),
        loadAdminData('/admin/winners'),
      ])
    } catch (error) {
      showAppError(error)
    }
  }

  const handleRerunPendingWinner = async (drawId) => {
    if (!drawId) {
      showAppError(new Error('The selected draw is missing an id. Please refresh the winners page and try again.'))
      return
    }

    try {
      await apiRequest(`/api/admin/draw-winners/${drawId}/rerun`, {
        method: 'POST',
        body: {},
      })
      await loadAdminData('/admin/winners')
    } catch (error) {
      showAppError(error)
    }
  }

  const renderPage = () => {
    const isAdmin = authUser?.role === 'admin'
    const isProtectedPath = protectedUserPaths.includes(path)

    if (!isAuthenticated && !isAuthLoading && isProtectedPath) {
      return (
        <Login
          onGoSignup={() => navigate('/signup')}
          onGoForgotPassword={() => navigate('/forgot-password')}
          onLogin={handleLogin}
          onResendVerification={handleResendVerification}
        />
      )
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
            draws={visibleDraws}
            winners={winners}
            serverNow={serverNow}
            onEnterDraw={handleEnterDraw}
            onViewDraw={handleViewDraw}
            celebration={entryCelebration}
            onDismissCelebration={() => setEntryCelebration(null)}
            onCelebrateWinner={handleCelebrateWinnerCard}
            isLoading={isHomeLoading}
          />
        )
      case '/login':
        return (
          <Login
            onGoSignup={() => navigate('/signup')}
            onGoForgotPassword={() => navigate('/forgot-password')}
            onLogin={handleLogin}
            onResendVerification={handleResendVerification}
          />
        )
      case '/signup':
        return <Signup onGoLogin={() => navigate('/login')} onSignup={handleSignup} />
      case '/signup-success':
        return <SignupSuccess onGoLogin={() => navigate('/login')} />
      case '/forgot-password':
        return <ForgotPassword onBackToLogin={() => navigate('/login')} onSubmit={handleForgotPassword} />
      case '/reset-password':
        return <ResetPassword onBackToLogin={() => navigate('/login')} onSubmit={handleResetPassword} />
      case '/email-verified':
        return (
          <VerificationSuccess
            isAuthenticated={isAuthenticated}
            onNavigate={navigate}
          />
        )
      case '/dashboard':
        return (
          <Dashboard
            user={sharedUser}
            recentEntries={recentEntries}
            notificationsUnreadCount={notificationsUnreadCount}
            onNavigate={navigate}
            canOpenTestimonials={testimonialAccess.canSubmit}
            testimonial={testimonials.find((item) => item.userId === sharedUser.userId) || null}
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
            isBanksLoading={isBanksLoading}
            banksError={banksError}
            supportContact={SUPPORT_CONTACT}
            onFundWallet={() => setIsFundingOpen(true)}
            onCloseFunding={() => setIsFundingOpen(false)}
            onSubmitFunding={handleSubmitFunding}
            onRetryBanks={refreshBanks}
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
            isAuthenticated={isAuthenticated}
            isEmailVerified={isEmailVerified}
          />
        )
      case '/winners':
        return <Winners winners={winners} testimonials={testimonials} onViewTestimonialImages={handleViewTestimonialImages} onCelebrateWinner={handleCelebrateWinnerCard} />
      case '/about':
        return (
          <AboutPage
            testimonials={testimonials}
            onViewTestimonialImages={handleViewTestimonialImages}
            onNavigate={navigate}
          />
        )
      case '/notifications':
        return (
          <Notifications
            notifications={notifications}
            hasMore={notificationsHasMore}
            onLoadMore={loadMoreNotifications}
            isLoadingMore={isNotificationsLoadingMore}
          />
        )
      case '/terms':
      case '/terms-and-conditions':
        return <LegalPage variant="terms" />
      case '/privacy':
      case '/privacy-policy':
        return <LegalPage variant="privacy" />
      case '/rules':
      case '/disclaimer':
        return <LegalPage variant="disclaimer" />
      case '/testimonials':
        return (
          <Testimonials
            testimonials={testimonials}
            access={testimonialAccess}
            currentUserId={sharedUser.userId}
            onSubmitTestimonial={handleSubmitTestimonial}
            onUpdateTestimonial={handleUpdateTestimonial}
            onViewImages={handleViewTestimonialImages}
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
            onUpdateReferralSettings={handleUpdateReferralSettings}
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
              slotNumber: winner.slotNumber,
            }))}
            pendingWinners={pendingDrawWinners}
            onAnnounceWinner={handleAnnouncePendingWinner}
            onRerunWinner={handleRerunPendingWinner}
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
      case '/admin/testimonials':
        return (
          <AdminTestimonials
            testimonials={testimonials}
            onUpdateTestimonial={handleUpdateTestimonial}
            onDeleteTestimonial={handleDeleteTestimonial}
            onViewImages={handleViewTestimonialImages}
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
            draws={visibleDraws}
            winners={winners}
            serverNow={serverNow}
            onViewDraw={handleViewDraw}
            onEnterDraw={handleEnterDraw}
            celebration={entryCelebration}
            onDismissCelebration={() => setEntryCelebration(null)}
            onCelebrateWinner={handleCelebrateWinnerCard}
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
        notifications={notifications}
        notificationsUnreadCount={notificationsUnreadCount}
        isNotificationsOpen={isNotificationsOpen}
        isNotificationsLoading={isNotificationsLoading}
        onToggleNotifications={handleToggleNotifications}
        isAuthenticated={isAuthenticated}
        isAuthLoading={isAuthLoading}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />
      <main className="page-container">
        {serviceDegradedMessage ? (
          <section className="card feedback-banner feedback-banner-warning">
            <div className="row spread">
              <p>{serviceDegradedMessage}</p>
              <button type="button" className="text-link" onClick={() => setServiceDegradedMessage('')}>
                Dismiss
              </button>
            </div>
          </section>
        ) : null}
        {isAuthenticated && !isAuthLoading && !isEmailVerified ? (
          <section className="card feedback-banner feedback-banner-warning">
            <div className="row spread">
              <p>Your email is not verified yet. Verify now to enter draws, spin, and answer quiz.</p>
              <button
                type="button"
                className="text-link"
                disabled={isResendingVerificationBanner}
                onClick={handleResendVerificationFromBanner}
              >
                {isResendingVerificationBanner ? 'Resending...' : 'Resend verification email'}
              </button>
            </div>
          </section>
        ) : null}
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
      {!isAppInstalled ? (
        <button
          type="button"
          className="floating-install-btn"
          onClick={() => {
            markInstallPromptSeen()
            setIsInstallOpen(true)
          }}
          aria-label="Install app"
        >
          <span className="floating-btn-label">Install</span>
          <span className="floating-btn-icon">{'\u2193'}</span>
        </button>
      ) : null}
      <button type="button" className="floating-info-btn" onClick={openInfoModal} aria-label="Platform information">
        <strong>?</strong>
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
        onClose={() => {
          markInstallPromptSeen()
          setIsInstallOpen(false)
        }}
        onInstall={handleInstallApp}
        canInstall={Boolean(deferredInstallPrompt)}
      />
      {testimonialViewer ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card stack">
            <div className="row spread">
              <h3>{testimonialViewer.title}</h3>
              <button type="button" className="text-link" onClick={() => setTestimonialViewer(null)}>
                Close
              </button>
            </div>
            <img
              src={testimonialViewer.images[testimonialViewer.activeIndex]}
              alt={testimonialViewer.title}
              style={{ width: '100%', borderRadius: '18px', maxHeight: '60vh', objectFit: 'contain' }}
            />
            {testimonialViewer.images.length > 1 ? (
              <div className="row">
                {testimonialViewer.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`btn ${index === testimonialViewer.activeIndex ? 'btn-primary' : 'btn-soft'}`}
                    onClick={() => setTestimonialViewer((prev) => ({ ...prev, activeIndex: index }))}
                  >
                    Image {index + 1}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {winnerCelebration ? (
        <div className="celebration-layer celebration-winner-login" role="dialog" aria-modal="true">
          <div className="confetti-field winner-confetti" aria-hidden="true">
            {Array.from({ length: 42 }, (_, piece) => (
              <span
                key={piece}
                className="confetti-piece"
                style={{
                  // Winner login celebration is intentionally louder than
                  // entry confirmation so the two moments feel distinct.
                  '--x': `${(piece % 12) * 8}%`,
                  '--delay': `${piece * 0.035}s`,
                  '--duration': `${2 + (piece % 6) * 0.18}s`,
                }}
              />
            ))}
          </div>
          <div className="celebration-card card">
            <p className="eyebrow">Congratulations</p>
            <h2>You won this draw!</h2>
            <p className="muted">
              Winning reference: <strong>{winnerCelebration.referenceId}</strong>
              {winnerCelebration.slotNumber ? ` | Draw Slot ${winnerCelebration.slotNumber}` : ''}
            </p>
            <p className="celebration-copy">{winnerCelebration.title}</p>
            <button type="button" className="btn btn-primary" onClick={() => setWinnerCelebration(null)}>
              Celebrate
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App

