import { createContext, useContext, useSyncExternalStore } from 'react'

export const PlayerContext = createContext(null)

export function usePlayer() {
  const { engine, audioRef } = useContext(PlayerContext)
  const state = useSyncExternalStore(engine.subscribe, engine.getSnapshot)
  return { ...state, audioRef,
    playSong: engine.playSong, togglePlay: engine.togglePlay,
    playNext: engine.playNext, playPrev: engine.playPrev,
    seekTo: engine.seekTo, changeVolume: engine.changeVolume,
    cyclePlayMode: engine.cyclePlayMode, retryPlayback: engine.retryPlayback,
    canPlayNext: engine.hasNext(),
  }
}

export function useMusicPlayer() {
  const { engine } = useContext(PlayerContext)
  const state = useSyncExternalStore(engine.subscribe, engine.getMusicSnapshot)
  return { ...state, playSong: engine.playSong }
}
