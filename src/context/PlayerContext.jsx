import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const audioRef = useRef(null)
  const [playlist, setPlaylist] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [playMode, setPlayMode] = useState('sequence') // sequence | random | single

  const currentSong = currentIndex >= 0 ? playlist[currentIndex] : null

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => {
      if (playMode === 'single') {
        // 单曲循环：重新播放当前歌曲
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else if (playMode === 'random') {
        // 随机播放：随机选择下一首
        if (playlist.length > 1) {
          let nextIndex
          do {
            nextIndex = Math.floor(Math.random() * playlist.length)
          } while (nextIndex === currentIndex)
          setCurrentIndex(nextIndex)
        }
      } else {
        // 顺序播放
        if (currentIndex < playlist.length - 1) {
          setCurrentIndex(i => i + 1)
        } else {
          setIsPlaying(false)
        }
      }
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [currentIndex, playlist.length, playMode])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || currentIndex < 0 || !currentSong) return
    audio.src = currentSong.url
    audio.load()
    if (isPlaying) {
      audio.play().catch(() => {})
    }
  }, [currentIndex, currentSong])

  const playSong = useCallback((songs, index) => {
    setPlaylist(songs)
    setCurrentIndex(index)
    setIsPlaying(true)
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }, [isPlaying, currentSong])

  const playNext = useCallback(() => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(i => i + 1)
    }
  }, [currentIndex, playlist.length])

  const playPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }, [currentIndex])

  const seekTo = useCallback((time) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    setCurrentTime(time)
  }, [])

  const changeVolume = useCallback((v) => {
    setVolume(v)
  }, [])

  const cyclePlayMode = useCallback(() => {
    setPlayMode(mode => {
      if (mode === 'sequence') return 'random'
      if (mode === 'random') return 'single'
      return 'sequence'
    })
  }, [])

  return (
    <PlayerContext.Provider value={{
      currentSong,
      currentIndex,
      isPlaying,
      currentTime,
      duration,
      volume,
      playlist,
      playMode,
      audioRef,
      playSong,
      togglePlay,
      playNext,
      playPrev,
      seekTo,
      changeVolume,
      cyclePlayMode,
    }}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
