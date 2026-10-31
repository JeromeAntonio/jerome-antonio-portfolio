import { useEffect, useState } from 'react'
import { ArrowUpRight, Code2, Award, Layers3 } from 'lucide-react'
import { profile } from '../data/siteData'
import { projects, certificates } from '../data/portfolioData'

function useCount(target, active) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let current = 0
    const step = Math.max(1, Math.ceil(target / 24))
    const timer = window.setInterval(() => {
      current = Math.min(target, current + step)
      setCount(current)
      if (current >= target) window.clearInterval(timer)
    }, 35)
    return () => window.clearInterval(timer)
  }, [target, active])
  return count
}

function StatCard({ icon: Icon, number, label, onClick }) {
  const [seen, setSeen] = useState(false)
  const count = useCount(number, seen)
  return (
    <button className="stat-card" onClick={onClick} onMouseEnter={() => setSeen(true)} onFocus={() => setSeen(true)}>
      <span className="stat-icon"><Icon size={19} /></span>
      <span className="stat-number">{count}<small>+</small></span>
      <span className="stat-label">{label}</span>
      <ArrowUpRight className="stat-arrow" size={17} />
    </button>
  )
}

export default function AboutSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <section className="section-shell section-space" id="about">
      <div className="section-heading reveal"><p className="eyebrow">A LITTLE ABOUT ME</p><h2>Curious mind.<br /><span className="muted-heading">Creative builder.</span></h2><p>Getting to know the person behind the code.</p></div>
      <div className="about-layout">
        <div className="about-photo reveal"><img src="/profile-placeholder.svg" alt="Profile placeholder for Jerome Antonio" /><span className="photo-caption">BASED IN NUEVA ECIJA, PH</span></div>
        <div className="about-content reveal">
          <p className="eyebrow">WHO I AM</p><h3>{profile.name}</h3>
          <p>{profile.about}</p>
          <p>Currently pursuing {profile.course} at {profile.school}. I am interested in frontend development, responsive web design, user interface development, modern web technologies, and problem solving.</p>
          <blockquote>{profile.quote}</blockquote>
          <div className="stats-grid">
            <StatCard icon={Code2} number={projects.length} label="PROJECTS" onClick={() => scrollTo('portfolio')} />
            <StatCard icon={Award} number={certificates.length} label="CERTIFICATES" onClick={() => scrollTo('portfolio')} />
            <StatCard icon={Layers3} number={projects.filter(p => p.status === 'Completed').length} label="COMPLETED WORKS" onClick={() => scrollTo('portfolio')} />
          </div>
        </div>
      </div>
    </section>
  )
}
