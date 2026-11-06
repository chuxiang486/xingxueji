import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PlayerEngine } from './playerEngine.js'

const songs = Array.from({ length: 3 }, (_, id) => ({ id, url: `/song-${id}.mp3`, title: `Song ${id}`, artist: 'Artist' }))
class FakeAudio extends EventTarget {
  currentTime = 0
  duration = 120
  paused = true
  ended = false
  play = () => { this.paused = false; this.dispatchEvent(new Event('playing')); return Promise.resolve() }
  pause = () => { this.paused = true; this.dispatchEvent(new Event('pause')) }
  load = () => { this.currentTime = 0 }
  removeAttribute() {}
}
function setup(t, options = {}) {
  const engine = new PlayerEngine(options)
  const audio = new FakeAudio()
  const detach = engine.attach(audio)
  t.after(detach)
  return { engine, audio }
}
const settle = () => new Promise(resolve => setImmediate(resolve))

test('preferences survive a new player; malformed and blocked storage fall back safely', t => {
  let saved = '{}'
  const storage = { getItem: () => saved, setItem: (_, value) => { saved = value } }
  const { engine, audio } = setup(t, { storage })
  engine.changeVolume(0.28)
  engine.cyclePlayMode()
  assert.equal(audio.volume, 0.28)
  const restored = new PlayerEngine({ storage }).state
  assert.equal(restored.volume, 0.28)
  assert.equal(restored.playMode, 'random')
  saved = '{broken'
  assert.equal(new PlayerEngine({ storage }).state.volume, 0.7)
  saved = '{"volume":null,"playMode":"invalid"}'
  assert.equal(new PlayerEngine({ storage }).state.playMode, 'sequence')
  const blocked = new PlayerEngine({ storage: { getItem() { throw Error() }, setItem() { throw Error() } } })
  assert.doesNotThrow(() => blocked.changeVolume(0.5))
})

test('loading, buffering, network errors, and retry reflect real playback events', async t => {
  const { engine, audio } = setup(t)
  let finish
  audio.play = () => new Promise(resolve => { finish = resolve })
  engine.playSong(songs, 0)
  assert.equal(engine.state.status, 'loading')
  assert.equal(engine.state.isPlaying, false)
  audio.paused = false
  audio.dispatchEvent(new Event('playing'))
  assert.equal(engine.state.isPlaying, true)
  finish(); await settle()
  audio.dispatchEvent(new Event('waiting'))
  assert.equal(engine.state.status, 'loading')
  audio.error = { code: 2 }
  audio.dispatchEvent(new Event('error'))
  assert.equal(engine.state.status, 'error')
  assert.match(engine.state.error, /网络/)
  audio.error = null
  audio.play = () => { audio.paused = false; audio.dispatchEvent(new Event('playing')); return Promise.resolve() }
  engine.retryPlayback(); await settle()
  assert.equal(engine.state.status, 'ready')
  assert.equal(engine.state.error, '')
})

test('late failures from a previous song cannot fail the new song', async t => {
  const { engine, audio } = setup(t)
  let rejectOld
  audio.play = () => new Promise((_, reject) => { rejectOld = reject })
  engine.playSong(songs, 0)
  audio.play = () => { audio.paused = false; audio.dispatchEvent(new Event('playing')); return Promise.resolve() }
  engine.playNext()
  rejectOld(new Error('old network error'))
  await settle()
  assert.equal(engine.state.currentIndex, 1)
  assert.equal(engine.state.status, 'ready')
})

test('autoplay denial is actionable; cancelled loads do not later surface an error', async t => {
  const { engine, audio } = setup(t)
  audio.play = () => Promise.reject(Object.assign(new Error(), { name: 'NotAllowedError' }))
  engine.playSong(songs, 0); await settle()
  assert.match(engine.state.error, /点击播放/)
  let reject
  audio.play = () => new Promise((_, fail) => { reject = fail })
  engine.retryPlayback()
  engine.pause()
  reject(new Error('cancelled')); await settle()
  assert.equal(engine.state.status, 'ready')
  assert.equal(engine.state.isPlaying, false)
})

test('random next avoids repeat and previous uses history; single mode loops at end', async t => {
  const { engine, audio } = setup(t, { random: () => 0.9 })
  engine.playSong(songs, 0)
  engine.cyclePlayMode()
  engine.playNext()
  assert.equal(engine.state.currentIndex, 2)
  engine.playPrev()
  assert.equal(engine.state.currentIndex, 0)
  engine.cyclePlayMode()
  audio.ended = true
  audio.dispatchEvent(new Event('ended')); await settle()
  assert.equal(engine.state.currentIndex, 0)
  assert.equal(engine.state.isPlaying, true)
})

test('sequence ends cleanly and selecting the same paused song resumes', async t => {
  const { engine } = setup(t)
  engine.playSong(songs, 2)
  engine.audio.dispatchEvent(new Event('ended'))
  assert.equal(engine.state.isPlaying, false)
  assert.equal(engine.hasNext(), false)
  engine.pause()
  engine.playSong(songs, 2); await settle()
  assert.equal(engine.state.isPlaying, true)
})

test('a stalled load times out and can be retried', async t => {
  const { engine, audio } = setup(t, { timeoutMs: 15 })
  audio.play = () => new Promise(() => {})
  engine.playSong(songs, 0)
  await new Promise(resolve => setTimeout(resolve, 35))
  assert.equal(engine.state.status, 'error')
  assert.match(engine.state.error, /加载时间过长/)
})

test('lock-screen metadata, actions, position, and cleanup stay in sync', t => {
  const actions = {}
  const session = { setActionHandler: (name, fn) => { actions[name] = fn }, setPositionState: value => { session.position = value } }
  const { engine, audio } = setup(t, { session, Metadata: class { constructor(data) { Object.assign(this, data) } } })
  engine.playSong(songs, 0)
  assert.equal(session.metadata.title, 'Song 0')
  assert.equal(session.playbackState, 'playing')
  audio.dispatchEvent(new Event('loadedmetadata'))
  actions.seekto({ seekTime: 999 })
  assert.equal(audio.currentTime, 120)
  assert.equal(session.position.position, 120)
  actions.pause()
  assert.equal(session.playbackState, 'paused')
  actions.nexttrack()
  assert.equal(session.metadata.title, 'Song 1')
  assert.equal(session.position, undefined)
})
