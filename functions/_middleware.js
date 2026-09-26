const QINIU_BASE = 'http://music.026924.xyz'

export async function onRequest(context) {
  const { request, next } = context
  const url = new URL(request.url)

  if (url.pathname.startsWith('/music/')) {
    const filename = url.pathname.slice('/music/'.length)
    if (!filename) {
      return new Response('Not Found', { status: 404 })
    }
    const qiniuUrl = `${QINIU_BASE}/${filename}`
    const headers = new Headers(request.headers)
    headers.set('Referer', 'https://026924.xyz')
    const response = await fetch(qiniuUrl, {
      method: request.method,
      headers,
    })
    const newHeaders = new Headers(response.headers)
    newHeaders.set('Access-Control-Allow-Origin', '*')
    newHeaders.set('Cache-Control', 'public, max-age=31536000')
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    })
  }

  return next()
}
