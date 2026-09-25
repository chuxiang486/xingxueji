import { useEffect, useRef } from 'react'
import './CursorGlow.css'

export default function CursorGlow() {
  const glowRef = useRef(null)

  useEffect(() => {
    const el = glowRef.current
    if (!el) return

    let rafId = null
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const handleMouseMove = (e) => {
      targetX = e.clientX
      targetY = e.clientY
      if (!rafId) {
        rafId = requestAnimationFrame(animate)
      }
    }

    const animate = () => {
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12
      el.style.transform = `translate(${currentX - 200}px, ${currentY - 200}px)`
      if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        rafId = requestAnimationFrame(animate)
      } else {
        rafId = null
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return <div ref={glowRef} className="cursor-glow" />
}
