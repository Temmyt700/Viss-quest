const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

const sanitizeRequestHeaders = (requestHeaders) => {
  const headers = new Headers(requestHeaders)
  headers.delete('host')
  return headers
}

const sanitizeResponseHeaders = (responseHeaders) => {
  const headers = new Headers(responseHeaders)
  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header))
  headers.set('Cache-Control', 'no-store')
  return headers
}

export async function onRequest(context) {
  const backendOrigin = (context.env.BACKEND_ORIGIN || '').trim()
  if (!backendOrigin) {
    return Response.json(
      {
        message: 'Backend proxy is not configured yet.',
      },
      { status: 500 },
    )
  }

  const incomingUrl = new URL(context.request.url)
  const targetOrigin = new URL(backendOrigin)
  const upstreamUrl = new URL(incomingUrl.pathname + incomingUrl.search, targetOrigin)
  const method = context.request.method.toUpperCase()

  const headers = sanitizeRequestHeaders(context.request.headers)
  headers.set('x-forwarded-host', incomingUrl.host)
  headers.set('x-forwarded-proto', incomingUrl.protocol.replace(':', ''))

  const requestInit = {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : context.request.body,
    redirect: 'manual',
  }

  let upstreamResponse
  try {
    upstreamResponse = await fetch(upstreamUrl.toString(), requestInit)
  } catch (_error) {
    return Response.json(
      {
        message: 'Service is temporarily unavailable right now. Please try again in a moment.',
      },
      { status: 503 },
    )
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: sanitizeResponseHeaders(upstreamResponse.headers),
  })
}

