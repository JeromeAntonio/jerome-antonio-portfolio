import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { openNavHub, preloadNavHub } from './NavHub/NavHub'

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
        <div className="flex items-center gap-3 sm:gap-6">
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {links.map(([id, label]) => (
              <button key={id} className={active === id ? 'active' : ''} onClick={() => goTo(id)}>{label}</button>
            ))}
          </div>

          {/* 3D navigation hub trigger */}
          <button
            type="button"
            onClick={() => { setMenuOpen(false); openNavHub() }}
            onMouseEnter={preloadNavHub}
            onFocus={preloadNavHub}
            onTouchStart={preloadNavHub}
            aria-label="Open 3D navigation hub"
            className="group relative inline-flex h-10 cursor-pointer items-center gap-2.5 rounded-full border-0 bg-[linear-gradient(110deg,#9b8cff,#70d9e8)] py-0 pl-2.5 pr-4 text-xs font-extrabold tracking-wide text-[#0b0c0f] shadow-[0_0_26px_rgba(155,140,255,.5)] transition duration-300 hover:scale-105 hover:shadow-[0_0_38px_rgba(112,217,232,.65)] active:scale-95"
          >
            <span className="pointer-events-none absolute -inset-1 -z-10 animate-pulse rounded-full bg-[#9b8cff]/30 blur-md" />
            <span className="relative grid h-6 w-6 place-items-center">
              <span className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_0deg,#0b0c0f,#ffffff,#0b0c0f)] [animation-duration:3s]" />
              <span className="absolute inset-[3px] rounded-full bg-[#0b0c0f]" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            </span>
            Explore 3D
          </button>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
    </header>
  )
}