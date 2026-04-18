const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'message' in payload
      ? payload.message
      : 'Request failed.'
    const code = typeof payload === 'object' && payload !== null && 'code' in payload ? payload.code : null

    if (/database|failed query|drizzlequeryerror/i.test(String(message))) {
      throw new Error('Service is temporarily unavailable right now. Please try again in a moment.')
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

export async function apiRequest(path, options = {}) {
  const { body, isFormData = false, headers, ...rest } = options
  const requestHeaders = new Headers(headers || {})

  let nextBody = body
  if (body && !isFormData) {
    requestHeaders.set('Content-Type', 'application/json')
    nextBody = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      cache: 'no-store',
      ...rest,
      headers: requestHeaders,
      body: nextBody,
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Please check your internet connection and try again.')
    }

    throw error
  }

  return parseResponse(response)
}

export { API_BASE_URL }
