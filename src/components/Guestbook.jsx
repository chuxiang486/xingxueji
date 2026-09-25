import { useEffect, useRef } from 'react'
import useScrollReveal from '../hooks/useScrollReveal'
import './Guestbook.css'

const TWIKOO_ENV = 'https://twikoo-xingxueji.2552879962.workers.dev'

export default function Guestbook() {
  const [sectionRef, sectionVisible] = useScrollReveal()
  const twikooRef = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || !twikooRef.current) return
    initialized.current = true

    import('twikoo').then((twikoo) => {
      twikoo.default.init({
        envId: TWIKOO_ENV,
        el: twikooRef.current,
        region: 'ap-shanghai',
        lang: 'zh-CN',
      })
    })
  }, [])

  return (
    <section className="guestbook" id="guestbook" ref={sectionRef}>
      <h2 className={`section-title${sectionVisible ? ' reveal' : ''}`}>留言板</h2>
      <p className={`guestbook-desc${sectionVisible ? ' reveal' : ''}`}>
        说点什么吧，留下你来过的痕迹
      </p>
      <div className="twikoo-container" ref={twikooRef} />
    </section>
  )
}
