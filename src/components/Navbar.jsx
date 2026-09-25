import { useState, useEffect } from 'react'
import './Navbar.css'

const navLinks = [
  { href: '#gallery', label: '图片', id: 'gallery' },
  { href: '#music', label: '音乐', id: 'music' },
  { href: '#collection', label: '收藏', id: 'collection' },
  { href: '#guestbook', label: '留言', id: 'guestbook' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)

      const scrollPos = window.scrollY + 120
      let current = ''
      for (const link of navLinks) {
        const section = document.getElementById(link.id)
        if (section && section.offsetTop <= scrollPos) {
          current = link.href
        }
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleBrandClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <span className="navbar-brand" onClick={handleBrandClick}>星屑集</span>
      <div className="navbar-links">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={activeSection === link.href ? 'active' : ''}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
