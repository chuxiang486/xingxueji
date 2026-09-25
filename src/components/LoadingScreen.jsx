import { useState, useEffect } from 'react'
import './LoadingScreen.css'

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      const removeTimer = setTimeout(() => setVisible(false), 800)
      return () => clearTimeout(removeTimer)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className={`loading-screen${fadeOut ? ' fade-out' : ''}`}>
      <div className="loading-content">
        <div className="loading-star" />
        <p className="loading-text">星屑集</p>
      </div>
    </div>
  )
}
