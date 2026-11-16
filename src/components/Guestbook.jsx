import { useEffect, useRef, useState } from 'react'
import useScrollReveal from '../hooks/useScrollReveal'
import './Guestbook.css'

const TWIKOO_ENV = 'https://twikoo.026924.xyz'

export default function Guestbook() {
  const [sectionRef, sectionVisible] = useScrollReveal()
  const twikooRef = useRef(null)
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!sectionVisible || !twikooRef.current) return
    let cancelled = false
    const container = twikooRef.current

    const initialize = async () => {
      try {
        const twikoo = await import('twikoo')
        if (cancelled) return
        await twikoo.default.init({
          envId: TWIKOO_ENV,
          el: container,
          region: 'ap-shanghai',
          lang: 'zh-CN',
        })
        if (!cancelled) setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    initialize()
    return () => { cancelled = true }
  }, [sectionVisible, attempt])

  return (
    <section className="guestbook" id="guestbook" ref={sectionRef}>
      <h2 className={`section-title${sectionVisible ? ' reveal' : ''}`}>留言板</h2>
      <p className={`guestbook-desc${sectionVisible ? ' reveal' : ''}`}>
        说点什么吧，留下你来过的痕迹
      </p>
      <div className="guestbook-status" role="status">
        {status === 'loading' && '留言板加载中…'}
        {status === 'error' && <>
          留言板暂时无法加载。
          <button type="button" className="tab" onClick={() => {
            twikooRef.current?.replaceChildren()
            setStatus('loading')
            setAttempt(value => value + 1)
          }}>重试</button>
        </>}
      </div>
      <div className="twikoo-container" ref={twikooRef} aria-busy={status === 'loading'} />
    </section>
  )
}
