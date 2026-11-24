import { useEffect, useState } from 'react'

export default function ManagedContent({ sections, children, id, title }) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    async function load(section) {
      const response = await fetch('/api/content?section=' + section, { signal: controller.signal })
      if (!response.ok) throw new Error('Content unavailable')
      const data = await response.json()
      if (!Array.isArray(data.items)) throw new Error('Invalid content')
      return data.items
    }
    Promise.all(sections.split(',').map(load)).then(result => {
      if (!controller.signal.aborted) setItems(result)
    }).catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [sections, attempt])
  if (items) return children(...items)
  return <section id={id} className={id}><h2 className="section-title reveal">{title}</h2>
    <p role="status">{error ? '内容暂时无法加载' : '加载中…'}</p>
    {error && <button className="tab" onClick={() => { setError(false); setAttempt(n => n + 1) }}>重新加载</button>}
  </section>
}
