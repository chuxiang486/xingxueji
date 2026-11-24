import { sections, galleryCategories, watchStatuses } from './sections.js'

const el = id => document.getElementById(id)
const login = el('login')
const workspace = el('workspace')
const editor = el('editor')
const list = el('list')
const status = el('status')
let token = ''
let songs = []
let selected = null
let kind = 'songs'
let songCategories = []
el('section').replaceChildren(...Object.entries(sections).map(([key, value]) => new Option(value.label, key)))

async function api(method = 'GET', body) {
  const endpoint = kind === 'songs' ? '/api/songs?manage' : '/api/content?manage&section=' + kind
  const response = await fetch(endpoint, {
    method,
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || '请求失败')
  return result
}

function renderList() {
  const q = el('query').value.trim().toLowerCase()
  const visible = songs.filter(item => Object.keys(sections[kind].fields).some(key => String(item[key] ?? '').toLowerCase().includes(q)))
  list.replaceChildren(...visible.map(s => new Option([s.title,s.artist || s.category || s.platform || s.status].filter(Boolean).join(' · '), s.id)))
  list.value = selected?.id ?? ''
}

function edit(song) {
  selected = song
  const labels = Object.entries(sections[kind].fields).map(([key, label]) => {
    let choices
    if (key === 'category' && kind === 'songs') choices = songCategories
    if (key === 'category' && kind === 'gallery') choices = galleryCategories
    if (key === 'status') choices = watchStatuses
    const input = document.createElement(choices ? 'select' : 'input')
    if (choices) input.replaceChildren(...choices.map(value => new Option(value,value)))
    input.name = key
    input.required = ['title','src','url','artist','rating'].includes(key)
    if (key === 'rating') { input.type = 'number'; input.min = 1; input.max = 10 }
    if (key === 'src') input.placeholder = 'https://… 或 /images/文件名.webp'
    if (song?.[key] != null) input.value = song[key]
    const wrapper = document.createElement('label')
    wrapper.append(label,input)
    return wrapper
  })
  el('fields').replaceChildren(...labels)
  const preview = el('preview')
  preview.hidden = !song?.src
  if (song?.src) preview.src = new URL(song.thumbnail || song.src, location.origin).href
  else preview.removeAttribute('src')
  el('remove').hidden = !song
  el('heading').textContent = (song ? '编辑' : '新增') + sections[kind].label
  list.value = song?.id ?? ''
}

async function load(id) {
  const data = await api()
  songs = data.items ?? data.songs
  if (data.categories) songCategories = data.categories.slice(1)
  renderList()
  edit(songs.find(s => s.id === id))
}

async function busy(action) {
  workspace.disabled = true
  login.querySelector('button').disabled = true
  status.textContent = '正在处理…'
  try { await action() }
  catch (error) { status.textContent = error.message || '请求失败，请重试' }
  finally {
    workspace.disabled = false
    login.querySelector('button').disabled = false
  }
}

login.onsubmit = event => {
  event.preventDefault()
  if (login.querySelector('button').disabled) return
  token = login.elements.token.value
  busy(async () => {
    await load()
    login.reset()
    login.hidden = true
    workspace.hidden = false
    status.textContent = '已加载 ' + songs.length + ' 条记录'
  })
}
el('query').oninput = renderList
list.onchange = () => edit(songs.find(s => String(s.id) === list.value))
el('section').onchange = () => busy(async () => {
  const oldKind = kind
  kind = el('section').value
  try { await load() } catch (error) { kind = oldKind; el('section').value = kind; throw error }
  el('query').value = ''
  renderList()
  status.textContent = '已加载 ' + songs.length + ' 条记录'
})
el('create').onclick = () => { edit(null); editor.elements.title.focus() }
el('reload').onclick = () => busy(async () => { await load(selected?.id); status.textContent = '栏目已刷新' })
el('logout').onclick = () => { token = ''; location.reload() }

async function save(method, fields) {
  await busy(async () => {
    const result = await api(method, fields)
    edit(null)
    try {
      await load(result.id)
      status.textContent = method === 'DELETE' ? '条目已删除' : '已保存，刷新首页即可看到更新'
    } catch { status.textContent = '更改已保存，列表刷新失败，请点重新加载' }
  })
}
editor.onsubmit = event => {
  event.preventDefault()
  const fields = Object.fromEntries(new FormData(editor))
  if (selected) Object.assign(fields, { id: selected.id, revision: selected.revision })
  save(selected ? 'PUT' : 'POST', fields)
}
el('remove').onclick = () => {
  if (selected && confirm('从' + sections[kind].label + '删除《' + selected.title + '》？')) {
    save('DELETE', { id: selected.id, revision: selected.revision })
  }
}
