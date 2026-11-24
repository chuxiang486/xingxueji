import { images } from '../src/data/images.js'
import { wallpapers } from '../src/data/wallpapers.js'
import { animeList, gameList } from '../src/data/collections.js'
import { sections, galleryCategories, watchStatuses } from '../public/admin/sections.js'

const defaults = { gallery: images, wallpapers, anime: animeList, games: gameList }
const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } })

function validImage(src) {
  if (!src || /[\\\s]/.test(src)) return false
  try {
    const url = new URL(src, 'https://local.invalid')
    return (src.startsWith('https://') && !url.username && !url.password) ||
      (/^(?:\.\/|\/(?!\/))/.test(src) && url.origin === 'https://local.invalid')
  } catch { return false }
}

export async function handleContent({ request, env = {} }) {
  const params = new URL(request.url).searchParams
  const kind = params.get('section')
  if (!Object.hasOwn(defaults, kind)) return json({ error: '未知栏目' }, 404)
  const method = request.method
  if (!['GET','POST','PUT','DELETE'].includes(method)) return json({ error: '不支持此操作' }, 405)
  if (method !== 'GET' || params.has('manage')) {
    if (!env.DB || !env.ADMIN_TOKEN) return json({ error: '后台尚未配置' }, 503)
    if (request.headers.get('Authorization') !== 'Bearer ' + env.ADMIN_TOKEN) return json({ error: '管理密钥无效' }, 401)
  }
  try {
    const records = new Map(defaults[kind].map(item => [String(item.id), { ...item, id:String(item.id), revision:0 }]))
    if (env.DB) {
      const rows = await env.DB.prepare('SELECT id,payload,revision FROM content_changes WHERE section=? ORDER BY rowid').bind(kind).all()
      for (const row of rows.results) {
        if (row.payload === null) records.delete(row.id)
        else records.set(row.id, { ...JSON.parse(row.payload), id:row.id, revision:row.revision })
      }
    }
    if (method === 'GET') return json({ items:[...records.values()] })
    let data
    try { data = await request.json() } catch { return json({ error:'无效数据' }, 400) }
    if (!data || typeof data !== 'object') return json({ error:'无效数据' }, 400)
    const id = method === 'POST' ? crypto.randomUUID() : String(data.id)
    const prior = records.get(id)
    if (method !== 'POST' && (!prior || data.revision !== prior.revision)) return json({ error:'记录已更改，请重新加载' }, 409)
    let payload = null
    if (method !== 'DELETE') {
      const item = { ...prior }
      for (const key of Object.keys(sections[kind].fields)) {
        const value = String(data[key] ?? '').trim()
        if (value.length > (key === 'src' ? 4096 : 512)) return json({ error:'字段过长' }, 400)
        item[key] = value
      }
      if (!item.title || ('src' in item && !validImage(item.src)) ||
          (kind === 'gallery' && !galleryCategories.includes(item.category)) ||
          (kind === 'anime' && (!watchStatuses.includes(item.status) || !/^(10|[1-9])$/.test(item.rating)))) return json({ error:'请检查标题、图片地址、分类或评分' }, 400)
      if (prior && item.src !== prior.src) {
        for (const key of ['preview','srcSet','thumbnail','width','height','referenceUrl','identification','visibleCredit']) delete item[key]
      }
      payload = JSON.stringify(item)
    }
    const result = await env.DB.prepare(
      'INSERT INTO content_changes(section,id,payload,revision) VALUES(?,?,?,1) ON CONFLICT(section,id) DO UPDATE SET payload=excluded.payload,revision=content_changes.revision+1 WHERE content_changes.revision=?'
    ).bind(kind,id,payload,prior?.revision ?? 0).run()
    return result.meta.changes ? json({ id },method === 'POST' ? 201 : 200) : json({ error:'记录已更改，请重新加载' },409)
  } catch { return json({ error:'内容数据库暂时不可用，请检查数据库迁移' },503) }
}
