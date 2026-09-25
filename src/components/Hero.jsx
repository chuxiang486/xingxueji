import { useEffect, useState } from 'react'
import './Hero.css'

export default function Hero() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className={`hero-title${loaded ? ' reveal' : ''}`}>星屑集</h1>
        <p className={`hero-subtitle${loaded ? ' reveal' : ''}`}>收集散落在夜空中的光</p>
      </div>
    </section>
  )
}
