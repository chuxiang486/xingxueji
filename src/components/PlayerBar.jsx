import { usePlayer } from '../context/PlayerContext'
import './PlayerBar.css'

function formatTime(s) {
  if (!s || !isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function getFirstChar(title) {
  if (!title) return '?'
  const ch = title.charAt(0)
  return /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : ch
}

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playMode,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    changeVolume,
    cyclePlayMode,
    status,
    error,
    retryPlayback,
    canPlayNext,
  } = usePlayer()

  if (!currentSong) return null

  const progress = duration ? (currentTime / duration) * 100 : 0

  const loading = status === 'loading'
  const modeLabel = playMode === 'sequence' ? '顺序播放' : playMode === 'random' ? '随机播放' : '单曲循环'

  return (
    <section className="player-bar" aria-label="音乐播放器">
      <div className="player-progress-bg" aria-hidden="true">
        <div className="player-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="player-inner">
        <div className="player-left">
          <div className="player-cover">
            {getFirstChar(currentSong.title)}
          </div>
          <div className="player-info">
            <span className="player-title" title={currentSong.title}>{currentSong.title}</span>
            <span className="player-artist" title={currentSong.artist}>{currentSong.artist}</span>
          </div>
        </div>

        <div className="player-center">
          <span className="player-time">{formatTime(currentTime)}</span>
          <input type="range" className="player-seek" aria-label="播放进度"
            min="0" max={duration || 1} step="0.1" value={Math.min(currentTime, duration || 0)}
            disabled={!duration || status === 'error'}
            aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
            onChange={e => seekTo(Number(e.target.value))} />
          <span className="player-time">{formatTime(duration)}</span>
        </div>

        <div className="player-right">
          <button className="player-btn" onClick={playPrev} aria-label="上一首或回到开头" title="上一首或回到开头">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button className="player-btn player-btn-play" onClick={togglePlay} aria-label={loading ? '取消加载' : isPlaying ? '暂停' : status === 'error' ? '重试播放' : '播放'}>
            {loading ? <span className="player-spinner" aria-hidden="true" /> : isPlaying ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button className="player-btn" onClick={playNext} disabled={!canPlayNext} aria-label="下一首" title="下一首">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          <button
            className={`player-btn player-mode-btn ${playMode !== 'sequence' ? 'active' : ''}`}
            onClick={cyclePlayMode}
            title={modeLabel}
            aria-label={`播放模式：${modeLabel}，点击切换`}
          >
            {playMode === 'sequence' ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
            ) : playMode === 'random' ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zM12 15V9h-1l-2 1v1h1.5v4H12z" />
              </svg>
            )}
          </button>

          <div className="player-volume">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="player-volume-icon">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
              aria-label="音量"
              aria-valuetext={`${Math.round(volume * 100)}%`}
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="player-volume-slider"
            />
          </div>
        </div>
      </div>
      <div className={`player-feedback${error ? ' has-error' : ''}`}>
        <span role="status" aria-live="polite">{error || (loading ? '正在加载音乐…' : `${isPlaying ? '正在播放' : '已暂停'} · ${modeLabel}`)}</span>
        {error && <button className="player-retry" onClick={retryPlayback}>重试</button>}
      </div>
    </section>
  )
}
