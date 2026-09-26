const QINIU_BASE = 'http://music.026924.xyz'

export async function onRequest({ params, request }) {
  const filename = params.path
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
