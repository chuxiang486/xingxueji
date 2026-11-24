import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import { transformWithOxc } from 'vite'

// Exercise the real component effects with a deterministic clock and browser events.
// No network, system preference changes, or real comments are needed.
class Events {
  listeners = new Map()
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type).add(callback)
  }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback) }
  emit(type, event = {}) { for (const callback of this.listeners.get(type) ?? []) callback(event) }
  count() { return [...this.listeners.values()].reduce((sum, items) => sum + items.size, 0) }
}

async function mount(name, { nodes = [], visible = true, reduced = false, loadTwikoo } = {}) {
  const source = (await readFile(new URL(`../src/components/${name}.jsx`, import.meta.url), 'utf8'))
    .replace(/^import .*\r?\n/gm, '')
    .replace("import('twikoo')", 'loadTwikoo()')
    .replace('export default function', 'function')
  const { code } = await transformWithOxc(source, `${name}.jsx`, { jsx: { runtime: 'classic' } })
  const media = new Events()
  media.matches = reduced
  const pointer = new Events()
  pointer.matches = !reduced
  const document = new Events()
  document.hidden = false
  const window = new Events()
  window.innerWidth = 1280
  window.innerHeight = 800
  window.matchMedia = query => query.includes('pointer: fine') ? pointer : media
  const frames = new Map()
  const timers = new Map()
  const slots = []
  let cursor = 0
  let nodeIndex = 0
  let id = 0
  let now = 0
  let pending = []
  const context = {
    window, document, performance: { now: () => now },
    requestAnimationFrame: callback => { frames.set(++id, callback); return id },
    cancelAnimationFrame: key => frames.delete(key),
    setTimeout: callback => { timers.set(++id, callback); return id },
    clearTimeout: key => timers.delete(key),
    loadTwikoo,
    wallpapers: [{ id: 'one' }, { id: 'two' }],
    createPortal: element => element,
    React: { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }), Fragment: 'fragment' },
    useScrollReveal: () => [{ current: null }, visible],
    useRef: initial => {
      const index = cursor++
      return slots[index] ??= { current: nodes[nodeIndex++] ?? initial }
    },
    useState: initial => {
      const index = cursor++
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value }]
    },
    useCallback: callback => callback,
    useEffect: (effect, dependencies) => {
      const index = cursor++
      const previous = slots[index]
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        pending.push(() => {
          previous?.cleanup?.()
          slots[index] = { dependencies, cleanup: effect() }
        })
      }
    },
  }
  const component = vm.runInNewContext(`${code}\n${name}`, context)
  const harness = {
    media, pointer, window, document, frames, timers,
    render(nextVisible = visible) {
      visible = nextVisible
      cursor = 0
      nodeIndex = 0
      pending = []
      const tree = component({ wallpapers: context.wallpapers })
      pending.forEach(run => run())
      return tree
    },
    frame(time = now + 16) {
      now = time
      const callbacks = [...frames.values()]
      frames.clear()
      callbacks.forEach(callback => callback(now))
    },
    unmount() { slots.forEach(slot => slot?.cleanup?.()) },
  }
  return harness
}

function find(tree, predicate) {
  if (!tree || typeof tree !== 'object') return
  if (predicate(tree)) return tree
  for (const child of tree.children?.flat(Infinity) ?? []) {
    const result = find(child, predicate)
    if (result) return result
  }
}
const settle = () => new Promise(resolve => setImmediate(resolve))

test('stars pause in background, resume once, honor live motion changes, and release listeners', async () => {
  let paints = 0
  const ctx = { clearRect: () => paints++, beginPath() {}, arc() {}, fill() {} }
  const h = await mount('StarBackground', { nodes: [{ getContext: () => ctx }] })
  h.render()
  assert.equal(h.frames.size, 1)
  h.frame()
  h.document.hidden = true
  h.document.emit('visibilitychange')
  assert.equal(h.frames.size, 0)
  const before = paints
  h.frame()
  assert.equal(paints, before)
  h.document.hidden = false
  h.document.emit('visibilitychange')
  h.document.emit('visibilitychange')
  assert.equal(h.frames.size, 1)
  h.media.matches = true
  h.media.emit('change')
  assert.equal(h.frames.size, 0)
  h.window.emit('resize')
  assert.equal(h.frames.size, 0)
  h.media.matches = false
  h.media.emit('change')
  assert.equal(h.frames.size, 1)
  h.unmount()
  assert.equal(h.frames.size, 0)
  assert.equal(h.document.count() + h.window.count() + h.media.count(), 0)
})

test('stars render statically when reduced motion is enabled before mount', async () => {
  const ctx = { clearRect() {}, beginPath() {}, arc() {}, fill() {} }
  const h = await mount('StarBackground', { reduced: true, nodes: [{ getContext: () => ctx }] })
  h.render()
  assert.equal(h.frames.size, 0)
  h.unmount()
})

test('cursor cancels queued motion immediately when preference changes or page hides', async () => {
  const h = await mount('CursorGlow', { nodes: [{ style: {} }] })
  h.render()
  h.document.emit('mousemove', { clientX: 900, clientY: 500 })
  assert.equal(h.frames.size, 1)
  h.pointer.matches = false
  h.pointer.emit('change')
  assert.equal(h.frames.size, 0)
  h.pointer.matches = true
  h.document.emit('mousemove', { clientX: 300, clientY: 200 })
  h.document.hidden = true
  h.document.emit('visibilitychange')
  assert.equal(h.frames.size, 0)
  h.unmount()
  assert.equal(h.document.count() + h.pointer.count(), 0)
})

test('wallpaper changes cancel the previous animation; live reduced motion cancels distortion', async () => {
  const attributes = new Map()
  const svg = { querySelector: name => ({ setAttribute: (key, value) => attributes.set(`${name}:${key}`, value) }) }
  const h = await mount('Wallpaper', { nodes: [svg, null] })
  let tree = h.render()
  assert.equal(h.frames.size, 1)
  find(tree, node => node.props['aria-label'] === '换一张壁纸').props.onClick()
  tree = h.render()
  assert.equal(h.frames.size, 1)
  h.media.matches = true
  h.media.emit('change')
  h.frame()
  assert.equal(h.frames.size, 0)
  assert.equal(attributes.get('feDisplacementMap:scale'), '0')
  assert.equal(attributes.get('feGaussianBlur:stdDeviation'), '0')
  tree = h.render()
  assert.equal(find(tree, node => node.props.className === 'wallpaper-display revealing'), undefined)
  h.unmount()
  assert.equal(h.media.count(), 0)
})

test('loading overlay clears both pending timers when unmounted during fade', async () => {
  const h = await mount('LoadingScreen')
  h.render()
  assert.equal(h.timers.size, 1)
  const [id, callback] = [...h.timers][0]
  h.timers.delete(id)
  callback()
  assert.equal(h.timers.size, 1)
  h.unmount()
  assert.equal(h.timers.size, 0)
})

test('guestbook defers import, reports failure, and initializes successfully on retry', async () => {
  let imports = 0
  let initializations = 0
  let resets = 0
  const container = { replaceChildren: () => resets++ }
  const h = await mount('Guestbook', {
    visible: false, nodes: [container],
    loadTwikoo: async () => {
      imports++
      if (imports === 1) throw Error('offline')
      return { default: { init: async () => initializations++ } }
    },
  })
  h.render()
  assert.equal(imports, 0)
  h.render(true)
  await settle()
  let tree = h.render()
  const retry = find(tree, node => node.type === 'button')
  assert.ok(retry)
  retry.props.onClick()
  h.render()
  await settle()
  tree = h.render()
  assert.equal(imports, 2)
  assert.equal(initializations, 1)
  assert.equal(resets, 1)
  assert.equal(find(tree, node => node.props.className === 'twikoo-container').props['aria-busy'], false)
  h.unmount()
})

test('guestbook does not initialize after unmount while its script is loading', async () => {
  let resolveImport
  let initializations = 0
  const h = await mount('Guestbook', {
    nodes: [{}],
    loadTwikoo: () => new Promise(resolve => { resolveImport = resolve }),
  })
  h.render()
  h.unmount()
  resolveImport({ default: { init: async () => initializations++ } })
  await settle()
  assert.equal(initializations, 0)
})

test('guestbook initialization failure can be retried without reusing failed content', async () => {
  let calls = 0
  let resets = 0
  const container = { replaceChildren: () => resets++ }
  const h = await mount('Guestbook', {
    nodes: [container],
    loadTwikoo: async () => ({ default: { init: async options => {
      assert.equal(options.el, container)
      if (++calls === 1) throw Error('initialization failed')
    } } }),
  })
  h.render()
  await settle()
  const retry = find(h.render(), node => node.type === 'button')
  assert.ok(retry)
  retry.props.onClick()
  h.render()
  await settle()
  const tree = h.render()
  assert.equal(calls, 2)
  assert.equal(resets, 1)
  assert.equal(find(tree, node => node.props.className === 'twikoo-container').props['aria-busy'], false)
  h.unmount()
})

test('wallpaper skips distortion when reduced motion is already enabled', async () => {
  let writes = 0
  const svg = { querySelector: () => ({ setAttribute: () => writes++ }) }
  const h = await mount('Wallpaper', { reduced: true, nodes: [svg, null] })
  h.render()
  h.frame()
  assert.equal(h.frames.size, 0)
  assert.equal(writes, 0)
  const tree = h.render()
  assert.equal(find(tree, node => node.props.className === 'wallpaper-display revealing'), undefined)
  h.unmount()
})
