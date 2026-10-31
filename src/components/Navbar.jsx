import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  ['home', 'Home'],
  ['about', 'About'],
  ['portfolio', 'Portfolio'],
  ['experience', 'Experience'],
  ['contact', 'Contact'],
]

export default function Navbar() {
  const [active, setActive] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id)
      })
    }, { rootMargin: '-35% 0px -55% 0px' })

    links.forEach(([id]) => {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    })
    return () => observer.disconnect()
  }, [])

  const goTo = (id) => {
    if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' })
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="Main navigation">
        <button className="brand" onClick={() => goTo('home')} aria-label="Go to home">jerome<span>.dev</span></button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map(([id, label]) => (
            <button key={id} className={active === id ? 'active' : ''} onClick={() => goTo(id)}>{label}</button>
          ))}
        </div>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>
    </header>
  )
}
