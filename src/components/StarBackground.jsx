import { useEffect, useRef } from 'react'
import './StarBackground.css'

export default function StarBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationId
    let previousTime = null
    let stars = []
    let meteors = []
    let lastMeteorTime = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
      if (motionPreference.matches || document.hidden) draw(performance.now())
    }

    const initStars = () => {
      const count = Math.min(180, Math.floor((canvas.width * canvas.height) / 8000))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.15 + 0.05,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      }))
    }

    const spawnMeteor = () => {
      const angle = Math.PI / 6 + Math.random() * Math.PI / 6
      const speed = 8 + Math.random() * 6
      meteors.push({
        x: Math.random() * canvas.width * 0.8,
        y: -10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.008 + Math.random() * 0.006,
        trail: [],
        trailLength: 12 + Math.floor(Math.random() * 8),
      })
    }

    const draw = (now) => {
      const step = motionPreference.matches ? 0 : previousTime === null ? 1 : Math.min((now - previousTime) / (1000 / 60), 2)
      previousTime = now
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const star of stars) {
        star.y -= star.speed * step
        star.twinklePhase += star.twinkleSpeed * step

        if (star.y < -5) {
          star.y = canvas.height + 5
          star.x = Math.random() * canvas.width
        }

        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7
        const opacity = star.opacity * twinkle

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 195, 220, ${opacity})`
        ctx.fill()
      }

      if (!motionPreference.matches && now - lastMeteorTime > 3000 + Math.random() * 5000) {
        spawnMeteor()
        lastMeteorTime = now
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        m.trail.unshift({ x: m.x, y: m.y })
        if (m.trail.length > m.trailLength) m.trail.pop()

        m.x += m.vx * step
        m.y += m.vy * step
        m.life -= m.decay * step

        if (m.life <= 0 || m.x > canvas.width + 50 || m.y > canvas.height + 50) {
          meteors.splice(i, 1)
          continue
        }

        for (let j = 0; j < m.trail.length; j++) {
          const t = m.trail[j]
          const ratio = 1 - j / m.trail.length
          const alpha = ratio * m.life * 0.8
          const r = ratio * 2

          ctx.beginPath()
          ctx.arc(t.x, t.y, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(220, 210, 255, ${alpha})`
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(m.x, m.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${m.life})`
        ctx.fill()
      }

      if (!document.hidden && !motionPreference.matches) {
        animationId = requestAnimationFrame(draw)
      }
    }

    const syncAnimation = () => {
      cancelAnimationFrame(animationId)
      previousTime = null
      if (motionPreference.matches) meteors = []
      if (!document.hidden) draw(performance.now())
    }

    resize()
    syncAnimation()

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', syncAnimation)
    motionPreference.addEventListener('change', syncAnimation)
    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', syncAnimation)
      motionPreference.removeEventListener('change', syncAnimation)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="star-background" aria-hidden="true" />
}
