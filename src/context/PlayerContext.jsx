import { useRef, useState, useEffect, useMemo } from 'react'
import { PlayerEngine } from './playerEngine'
import { PlayerContext } from './usePlayer'

export function PlayerProvider({ children }) {
  const audioRef = useRef(null)
  const [engine] = useState(() => {
    let storage
    try { storage = window.localStorage } catch { /* Storage may be disabled. */ }
    return new PlayerEngine({ storage, session: navigator.mediaSession, Metadata: window.MediaMetadata })
  })
  const context = useMemo(() => ({ engine, audioRef }), [engine])
  useEffect(() => engine.attach(audioRef.current), [engine])

  return (
    <PlayerContext.Provider value={context}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </PlayerContext.Provider>
  )
}
