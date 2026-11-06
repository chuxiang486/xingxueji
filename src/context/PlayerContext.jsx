import { createContext, useContext, useRef, useState, useEffect, useSyncExternalStore } from 'react'
import { PlayerEngine } from './playerEngine'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const audioRef = useRef(null)
  const [engine] = useState(() => {
    let storage
    try { storage = window.localStorage } catch { /* Storage may be disabled. */ }
    return new PlayerEngine({ storage, session: navigator.mediaSession, Metadata: window.MediaMetadata })
  })
  const state = useSyncExternalStore(engine.subscribe, engine.getSnapshot)
  useEffect(() => engine.attach(audioRef.current), [engine])

  return (
    <PlayerContext.Provider value={{ ...state, audioRef,
      playSong: engine.playSong, togglePlay: engine.togglePlay,
      playNext: engine.playNext, playPrev: engine.playPrev,
      seekTo: engine.seekTo, changeVolume: engine.changeVolume,
      cyclePlayMode: engine.cyclePlayMode, retryPlayback: engine.retryPlayback,
      canPlayNext: engine.hasNext(),
    }}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </PlayerContext.Provider>
  )
}

export function usePlayer() { return useContext(PlayerContext) }
