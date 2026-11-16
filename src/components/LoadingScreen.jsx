import { useState, useEffect } from 'react'
import './LoadingScreen.css'

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    let removeTimer
    const timer = setTimeout(() => {
      setFadeOut(true)
      removeTimer = setTimeout(() => setVisible(false), 800)
    }, 600)
    return () => {
      clearTimeout(timer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div className={`loading-screen${fadeOut ? ' fade-out' : ''}`}>
      <div className="loading-content">
        <div className="loading-star" />
        <p className="loading-text">星尘集</p>
      </div>
    </div>
  )
}
