import { useEffect, useRef, useCallback, useState } from 'react'
import './EasterEgg.css'

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

export default function EasterEgg() {
  const [active, setActive] = useState(false)
  const canvasRef = useRef(null)
  const seqRef = useRef([])

  const trigger = useCallback(() => {
    setActive(true)
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      const key = e.key.toLowerCase === undefined ? e.key : e.key
      seqRef.current.push(key)
      if (seqRef.current.length > KONAMI.length) {
        seqRef.current.shift()
      }
      if (seqRef.current.length === KONAMI.length &&
          seqRef.current.every((k, i) => k.toLowerCase() === KONAMI[i].toLowerCase())) {
        trigger()
        seqRef.current = []
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [trigger])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let meteors = []
    let animId
    const startTime = performance.now()
    const duration = 4000

    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const angle = Math.PI / 6 + Math.random() * Math.PI / 4
        const speed = 10 + Math.random() * 8
        meteors.push({
          x: Math.random() * canvas.width * 1.2 - canvas.width * 0.1,
          y: -20 - Math.random() * 100,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.005 + Math.random() * 0.005,
          trail: [],
          trailLength: 20 + Math.floor(Math.random() * 15),
          hue: Math.random() > 0.5 ? 260 : 200,
        })
      }, i * 100)
    }

    const draw = () => {
      const elapsed = performance.now() - startTime
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        m.trail.unshift({ x: m.x, y: m.y })
        if (m.trail.length > m.trailLength) m.trail.pop()

        m.x += m.vx
        m.y += m.vy
        m.life -= m.decay

        if (m.life <= 0 || m.y > canvas.height + 50) {
          meteors.splice(i, 1)
          continue
        }

        for (let j = 0; j < m.trail.length; j++) {
          const t = m.trail[j]
          const ratio = 1 - j / m.trail.length
          const alpha = ratio * m.life * 0.9
          const r = ratio * 3

          ctx.beginPath()
          ctx.arc(t.x, t.y, r, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${m.hue}, 70%, 80%, ${alpha})`
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(m.x, m.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${m.hue}, 60%, 95%, ${m.life})`
        ctx.fill()
      }

      if (elapsed < duration || meteors.length > 0) {
        animId = requestAnimationFrame(draw)
      } else {
        setActive(false)
      }
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [active])

  if (!active) return null

  return (
    <div className="easter-egg-overlay">
      <canvas ref={canvasRef} className="easter-egg-canvas" />
      <p className="easter-egg-text">✨ 流星雨 ✨</p>
    </div>
  )
}
