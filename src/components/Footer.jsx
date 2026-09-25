import useScrollReveal from '../hooks/useScrollReveal'
import './Footer.css'

export default function Footer() {
  const [ref, visible] = useScrollReveal()

  return (
    <footer className={`footer${visible ? ' reveal' : ''}`} ref={ref}>
      <p>星屑集 · 收集散落在夜空中的光</p>
    </footer>
  )
}
