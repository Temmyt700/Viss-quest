const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? payload.message
        : 'Request failed.'
    throw new Error(message)
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...rest,
    headers: requestHeaders,
    body: nextBody,
  })

  return parseResponse(response)
}

export { API_BASE_URL }
