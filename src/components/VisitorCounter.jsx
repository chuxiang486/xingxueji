import { useState, useEffect } from 'react'
import './VisitorCounter.css'

export default function VisitorCounter() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('https://hits.sh/xingxueji.026924.xyz.json')
        const data = await res.json()
        setCount(data.total || data.today)
      } catch {
        setCount(null)
      }
    }
    fetchCount()
  }, [])

  if (count === null) return null

  return (
    <div className="visitor-counter">
      <span className="visitor-star">✦</span>
      <span className="visitor-text">
        第 <span className="visitor-num">{count.toLocaleString()}</span> 次访问
      </span>
    </div>
  )
}
