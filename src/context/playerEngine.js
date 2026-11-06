const MODES = ['sequence', 'random', 'single']
const SETTINGS_KEY = 'xingxueji.player.settings'

function readSettings(storage) {
  try {
    const value = JSON.parse(storage?.getItem(SETTINGS_KEY) || '{}')
    return {
      volume: typeof value?.volume === 'number' && Number.isFinite(value.volume) && value.volume >= 0 && value.volume <= 1 ? value.volume : 0.7,
      playMode: MODES.includes(value?.playMode) ? value.playMode : 'sequence',
    }
  } catch { return { volume: 0.7, playMode: 'sequence' } }
}

export class PlayerEngine {
  constructor({ storage, session, Metadata, random = Math.random, timeoutMs = 20000 } = {}) {
    Object.assign(this, { storage, session, Metadata, random, timeoutMs })
    this.listeners = new Set()
    this.request = 0
    this.history = []
    this.state = { playlist: [], currentIndex: -1, currentSong: null, isPlaying: false, currentTime: 0, duration: 0, status: 'idle', error: '', ...readSettings(storage) }
  }
  subscribe = (listener) => { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  getSnapshot = () => this.state
  update(patch) {
    this.state = { ...this.state, ...patch }
    this.syncSession()
    this.listeners.forEach(listener => listener())
  }
  persist() {
    try { this.storage?.setItem(SETTINGS_KEY, JSON.stringify({ volume: this.state.volume, playMode: this.state.playMode })) } catch { /* Storage may be disabled. */ }
  }
  clearTimer() { clearTimeout(this.timer); this.timer = null }
  loading() {
    this.update({ status: 'loading', error: '' })
    // Repeated buffering events must not keep postponing the deadline.
    if (!this.timer) this.timer = setTimeout(() => this.fail('加载时间过长，请检查网络后重试。'), this.timeoutMs)
  }
  fail(message) {
    this.clearTimer()
    this.request++
    this.wantsPlay = false
    this.audio?.pause()
    this.update({ status: 'error', error: message, isPlaying: false })
  }
  attach(audio) {
    this.audio = audio
    audio.volume = this.state.volume
    const handlers = {
      timeupdate: () => this.update({ currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0 }),
      loadedmetadata: () => {
        this.update({ duration: Number.isFinite(audio.duration) ? audio.duration : 0 })
        if (this.resumeAt) { this.seekTo(this.resumeAt); this.resumeAt = 0 }
      },
      durationchange: () => this.update({ duration: Number.isFinite(audio.duration) ? audio.duration : 0 }),
      playing: () => { if (!audio.paused) { this.clearTimer(); this.update({ status: 'ready', isPlaying: true, error: '' }) } },
      pause: () => {
        if (!audio.paused) return // Ignore a queued pause from the previous source.
        this.wantsPlay = false
        this.clearTimer()
        this.update({ isPlaying: false, ...(this.state.status === 'error' ? {} : { status: 'ready' }) })
      },
      waiting: () => { if (this.wantsPlay) this.loading() },
      stalled: () => { if (this.wantsPlay) this.loading() },
      error: () => {
        if (!audio.error) return
        this.fail(audio.error.code === 2 ? '网络异常，歌曲暂时无法加载。' : audio.error.code === 3 ? '音频解码失败，可以重试或换一首。' : '歌曲暂时无法播放，可以重试或换一首。')
      },
      ended: () => {
        this.clearTimer()
        if (this.state.playMode === 'single' || (this.state.playMode === 'random' && this.state.playlist.length === 1)) this.retryPlayback()
        else if (this.hasNext()) this.playNext()
        else { this.wantsPlay = false; this.update({ isPlaying: false, status: 'ready' }) }
      },
    }
    Object.entries(handlers).forEach(([event, handler]) => audio.addEventListener(event, handler))
    const actions = { play: this.resume, pause: this.pause, previoustrack: this.playPrev, nexttrack: this.playNext,
      seekto: ({ seekTime }) => this.seekTo(seekTime),
      seekbackward: ({ seekOffset = 10 }) => this.seekTo(audio.currentTime - seekOffset),
      seekforward: ({ seekOffset = 10 }) => this.seekTo(audio.currentTime + seekOffset),
    }
    Object.entries(actions).forEach(([action, handler]) => { try { this.session?.setActionHandler(action, handler) } catch { /* Unsupported action. */ } })
    return () => {
      this.request++
      this.wantsPlay = false
      this.clearTimer()
      Object.entries(handlers).forEach(([event, handler]) => audio.removeEventListener(event, handler))
      Object.keys(actions).forEach(action => { try { this.session?.setActionHandler(action, null) } catch { /* Unsupported action. */ } })
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      if (this.session) { this.session.metadata = null; this.session.playbackState = 'none' }
      this.audio = null
    }
  }
  syncSession() {
    if (!this.session) return
    const { currentSong, currentTime, duration, isPlaying } = this.state
    try {
      if (this.metadataSong !== currentSong) {
        this.metadataSong = currentSong
        if (this.Metadata) this.session.metadata = currentSong ? new this.Metadata({ title: currentSong.title, artist: currentSong.artist, album: '星尘集' }) : null
      }
      this.session.playbackState = currentSong ? (isPlaying ? 'playing' : 'paused') : 'none'
      if (duration > 0) this.session.setPositionState?.({ duration, playbackRate: 1, position: Math.min(duration, Math.max(0, currentTime)) })
      else this.session.setPositionState?.()
    } catch { /* Media Session support varies by browser. */ }
  }
  attemptPlay() {
    if (!this.audio) return
    const request = ++this.request
    this.wantsPlay = true
    this.loading()
    this.audio.play().then(() => {
      if (request === this.request && !this.audio.paused) {
        this.clearTimer()
        this.update({ status: 'ready', isPlaying: true, error: '' })
      }
    }).catch(error => {
      if (request !== this.request || error.name === 'AbortError') return
      this.fail(error.name === 'NotAllowedError' ? '浏览器暂停了播放，请点击播放按钮继续。' : '播放失败，请重试或换一首。')
    })
  }
  loadTrack(index, list = this.state.playlist) {
    if (!this.audio || !list[index]) return
    this.request++
    this.clearTimer()
    this.update({ playlist: list, currentIndex: index, currentSong: list[index], currentTime: 0, duration: 0, isPlaying: false, error: '', status: 'loading' })
    this.audio.src = list[index].url
    this.audio.load()
    // Keep play() within the click/OS action for mobile user activation.
    this.attemptPlay()
  }
  playSong = (list, index) => {
    if (!list[index]) return
    this.resumeAt = 0
    this.history = []
    if (this.state.currentSong?.id === list[index].id && this.state.currentSong?.url === list[index].url && this.state.status !== 'error') {
      this.update({ playlist: list, currentIndex: index, currentSong: list[index] })
      this.resume()
    } else this.loadTrack(index, list)
  }
  resume = () => {
    if (!this.state.currentSong) return
    if (this.state.status === 'error') this.retryPlayback()
    else { if (this.audio?.ended) this.audio.currentTime = 0; this.attemptPlay() }
  }
  pause = () => {
    this.request++
    this.wantsPlay = false
    this.clearTimer()
    this.audio?.pause()
    this.update({ isPlaying: false, ...(this.state.status === 'error' ? {} : { status: 'ready' }) })
  }
  togglePlay = () => this.wantsPlay ? this.pause() : this.resume()
  retryPlayback = () => { this.resumeAt = this.audio?.ended ? 0 : this.state.currentTime; this.loadTrack(this.state.currentIndex) }
  hasNext = () => this.state.currentIndex >= 0 && (this.state.playMode === 'random' ? this.state.playlist.length > 0 : this.state.currentIndex < this.state.playlist.length - 1)
  playNext = () => {
    const { currentIndex, playlist, playMode } = this.state
    if (!this.hasNext()) return
    this.resumeAt = 0
    this.history.push(currentIndex)
    const next = playMode === 'random' && playlist.length > 1
      ? (currentIndex + 1 + Math.floor(this.random() * (playlist.length - 1))) % playlist.length
      : playMode === 'random' ? currentIndex : currentIndex + 1
    this.loadTrack(next)
  }
  playPrev = () => {
    if (!this.audio || !this.state.currentSong) return
    if (this.audio.currentTime > 3) { this.seekTo(0); return }
    this.resumeAt = 0
    this.loadTrack(this.history.pop() ?? Math.max(0, this.state.currentIndex - 1))
  }
  seekTo = (time) => {
    if (!this.audio || !Number.isFinite(time) || this.state.duration <= 0) return
    const target = Math.min(this.state.duration, Math.max(0, time))
    this.audio.currentTime = target
    this.update({ currentTime: target })
  }
  changeVolume = (volume) => {
    if (!Number.isFinite(volume)) return
    volume = Math.min(1, Math.max(0, volume))
    if (this.audio) this.audio.volume = volume
    this.update({ volume })
    this.persist()
  }
  cyclePlayMode = () => { this.update({ playMode: MODES[(MODES.indexOf(this.state.playMode) + 1) % MODES.length] }); this.persist() }
}
