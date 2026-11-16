import { useEffect, useRef } from 'react'
import './CursorGlow.css'

export default function CursorGlow() {
  const glowRef = useRef(null)

  useEffect(() => {
    const el = glowRef.current
    if (!el) return
    const pointerPreference = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')

    let rafId = null
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const handleMouseMove = (e) => {
      if (!pointerPreference.matches || document.hidden) return
      targetX = e.clientX
      targetY = e.clientY
      if (!rafId) {
        rafId = requestAnimationFrame(animate)
      }
    }

    const animate = () => {
      if (!pointerPreference.matches || document.hidden) {
        rafId = null
        return
      }
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12
      el.style.transform = `translate(${currentX - 200}px, ${currentY - 200}px)`
      if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        rafId = requestAnimationFrame(animate)
      } else {
        rafId = null
      }
    }

    const stopIfInactive = () => {
      if (pointerPreference.matches && !document.hidden) return
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('visibilitychange', stopIfInactive)
    pointerPreference.addEventListener('change', stopIfInactive)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', stopIfInactive)
      pointerPreference.removeEventListener('change', stopIfInactive)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
}
