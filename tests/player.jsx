// Development-only harness; not an entry in the production build.
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PlayerProvider, usePlayer } from '../src/context/PlayerContext'
import PlayerBar from '../src/components/PlayerBar'
import '../src/App.css'

function silentWav() {
  const sampleRate = 8000
  const samples = sampleRate * 30
  const bytes = new Uint8Array(44 + samples * 2)
  const view = new DataView(bytes.buffer)
  const text = (offset, value) => [...value].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)))
  text(0, 'RIFF'); view.setUint32(4, bytes.length - 8, true); text(8, 'WAVE')
  text(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true)
  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true)
  text(36, 'data'); view.setUint32(40, samples * 2, true)
  return URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }))
}
const url = silentWav()
const tracks = [
  { id: 'local1', title: '本地测试音频 · 静音', artist: '星尘集播放器验证', url },
  { id: 'local2', title: '第二首 · 用于切歌验证', artist: '星尘集播放器验证', url },
  { id: 'missing', title: '失效音源 · 用于重试验证', artist: '星尘集播放器验证', url: '/tests/missing-audio.mp3' },
]
function Harness() {
  const player = usePlayer()
  return <main style={{ padding: 24 }}>
    <h1>播放器本地验证</h1>
    <p>测试音频为本地生成的 30 秒静音 WAV。</p>
    <button onClick={() => player.playSong(tracks.slice(0, 2), 0)}>播放本地测试音频</button>
    <button onClick={() => player.playSong(tracks, 2)}>播放失效音源</button>
    <PlayerBar />
  </main>
}
createRoot(document.getElementById('root')).render(<StrictMode><PlayerProvider><Harness /></PlayerProvider></StrictMode>)
