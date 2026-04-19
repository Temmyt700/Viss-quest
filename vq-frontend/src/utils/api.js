const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '/api')
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000)
const SAFE_RETRYABLE_METHODS = new Set(['GET', 'HEAD'])

const TECHNICAL_ERROR_PATTERN =
  /failed query|drizzlequeryerror|select\s|insert\s|update\s|delete\s|stack|syntaxerror|internal server error|und_err|ecconn|enotfound|route not found|<html|<!doctype/i

const toFriendlyMessage = (status, rawMessage) => {
  const message = String(rawMessage || '').trim()

  if (status === 401 || /authentication required|unauthorized/i.test(message)) {
    return 'Please sign in to continue.'
  }

  if (status === 403 && /verify your email|email_not_verified/i.test(message)) {
    return 'Please verify your email to continue.'
  }

  if (status === 403) {
    return 'You do not have permission to do that action.'
  }

  if (status === 404) {
    return 'We could not find what you requested. Please refresh and try again.'
  }

  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.'
  }

  if (status >= 500) {
    return 'Service is temporarily unavailable right now. Please try again in a moment.'
  }

  if (!message || TECHNICAL_ERROR_PATTERN.test(message)) {
    return 'Something went wrong. Please try again.'
  }

  return message
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const rawMessage = typeof payload === 'object' && payload !== null && 'message' in payload
      ? payload.message
      : 'Request failed.'
    const code = typeof payload === 'object' && payload !== null && 'code' in payload ? payload.code : null
    const message = toFriendlyMessage(response.status, rawMessage)

    if (response.status === 401 || /authentication required|unauthorized/i.test(String(rawMessage))) {
      const error = new Error('Please sign in to continue.')
      error.code = code || 'AUTH_REQUIRED'
      throw error
    }

    if (response.status === 403 && /verify your email|email_not_verified/i.test(String(rawMessage))) {
      const error = new Error('Please verify your email to continue.')
      error.code = code || 'EMAIL_NOT_VERIFIED'
      throw error
    }

    const error = new Error(message)
    if (code) {
      // Preserve machine-readable backend error codes for targeted UI behavior.
      error.code = code
    }
    throw error
  }

  return payload
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchWithTimeout(url, options) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export async function apiRequest(path, options = {}) {
  const { body, isFormData = false, headers, ...rest } = options
  if (!API_BASE_URL) {
    throw new Error('Service setup is incomplete. Please refresh, and if this continues contact support.')
  }

  const requestHeaders = new Headers(headers || {})

  let nextBody = body
  if (body && !isFormData) {
    requestHeaders.set('Content-Type', 'application/json')
    nextBody = JSON.stringify(body)
  }

  const method = String(rest.method || 'GET').toUpperCase()
  const shouldRetry = SAFE_RETRYABLE_METHODS.has(method)
  const maxAttempts = shouldRetry ? 2 : 1
  let response
  let lastError

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
        credentials: 'include',
        cache: 'no-store',
        ...rest,
        method,
        headers: requestHeaders,
        body: nextBody,
      })
      lastError = null
      break
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts) {
        await delay(300 * attempt)
        continue
      }
    }
  }

  if (!response && lastError) {
    if (lastError instanceof DOMException && lastError.name === 'AbortError') {
      throw new Error('The network is taking longer than expected. Please retry in a moment.')
    }

    if (lastError instanceof TypeError) {
      throw new Error('Please check your internet connection and try again.')
    }

    throw lastError
  }

  return parseResponse(response)
}

export { API_BASE_URL }
