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
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    changeVolume,
  } = usePlayer()

  if (!currentSong) return null

  const progress = duration ? (currentTime / duration) * 100 : 0

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    seekTo(ratio * duration)
  }

  return (
    <div className="player-bar">
      <div className="player-progress-bg" onClick={handleProgressClick}>
        <div className="player-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="player-inner">
        <div className="player-left">
          <div className="player-cover">
            {getFirstChar(currentSong.title)}
          </div>
          <div className="player-info">
            <span className="player-title">{currentSong.title}</span>
            <span className="player-artist">{currentSong.artist}</span>
          </div>
        </div>

        <div className="player-center">
          <span className="player-time">{formatTime(currentTime)}</span>
          <div className="player-bar-track" onClick={handleProgressClick}>
            <div className="player-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="player-time">{formatTime(duration)}</span>
        </div>

        <div className="player-right">
          <button className="player-btn" onClick={playPrev} disabled={!currentSong}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button className="player-btn player-btn-play" onClick={togglePlay}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button className="player-btn" onClick={playNext} disabled={!currentSong}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          <div className="player-volume">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="player-volume-icon">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
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
    </div>
  )
}
