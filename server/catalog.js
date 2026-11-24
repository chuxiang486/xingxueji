import { musicCategories, songs } from '../src/data/music.js'

const reply = (data, status = 200) => Response.json(data, {
  status, headers: { 'Cache-Control': 'no-store' },
})

function validAudioUrl(value) {
  try {
    const url = new URL(value, 'https://site.invalid')
    if (value.startsWith('/music/')) {
      return url.origin === 'https://site.invalid' && url.pathname.startsWith('/music/') && url.pathname.length > 7
    }
    return value.startsWith('https://') && url.protocol === 'https:' && !url.username && !url.password
  } catch { return false }
}

export async function catalog({ request, env = {} }) {
  const { searchParams } = new URL(request.url)
  const method = request.method
  const read = method === 'GET' || method === 'HEAD'
  if (!read && !['POST', 'PUT', 'DELETE'].includes(method)) {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD, POST, PUT, DELETE' } })
  }
  if (!read || searchParams.has('manage')) {
    if (!env.DB || !env.ADMIN_TOKEN) return reply({ error: '曲库管理尚未配置' }, 503)
    if (request.headers.get('Authorization') !== 'Bearer ' + env.ADMIN_TOKEN) {
      return reply({ error: '管理密钥无效' }, 401)
    }
  }
  if (read) {
    const rows = env.DB ? (await env.DB.prepare('SELECT * FROM songs ORDER BY id').all()).results : songs
    const category = searchParams.get('category')
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    const matches = rows.filter(song =>
      (!category || category === '全部' || song.category === category) &&
      (!q || song.artist.toLowerCase().includes(q) || song.title.toLowerCase().includes(q)))
    const response = reply({ categories: musicCategories, songs: matches })
    return method === 'HEAD' ? new Response(null, { headers: response.headers }) : response
  }
  let data
  try { data = await request.json() } catch { return reply({ error: '需要 JSON 数据' }, 400) }
  if (!data || typeof data !== 'object') return reply({ error: '歌曲格式无效' }, 400)
  const { id, revision } = data
  if (method !== 'POST' && ![id, revision].every(n => Number.isSafeInteger(n) && n > 0)) {
    return reply({ error: '歌曲编号或版本无效' }, 400)
  }
  let statement
  if (method === 'DELETE') {
    statement = env.DB.prepare('DELETE FROM songs WHERE id=? AND revision=?').bind(id, revision)
  } else {
    const fields = ['title','artist','category','url'].map(k => typeof data[k] === 'string' ? data[k].trim() : '')
    const [title, artist, category, url] = fields
    if (!title || title.length > 512 || !artist || artist.length > 512 ||
        !musicCategories.slice(1).includes(category) || url.length > 8192 || !validAudioUrl(url)) {
      return reply({ error: '请检查歌名、歌手、分类和音频地址' }, 400)
    }
    statement = method === 'POST'
      ? env.DB.prepare('INSERT INTO songs(title,artist,category,url) VALUES(?,?,?,?)').bind(...fields)
      : env.DB.prepare('UPDATE songs SET title=?,artist=?,category=?,url=?,revision=revision+1 WHERE id=? AND revision=?').bind(...fields,id,revision)
  }
  const { meta } = await statement.run()
  if (!meta.changes) return reply({ error: '这首歌已被修改或删除，请重新加载曲库' }, 409)
  return reply({ id: method === 'POST' ? meta.last_row_id : id }, method === 'POST' ? 201 : 200)
}

export async function handleCatalog(context) {
  try { return await catalog(context) }
  catch { return reply({ error: '曲库数据库暂时不可用' }, 503) }
}
