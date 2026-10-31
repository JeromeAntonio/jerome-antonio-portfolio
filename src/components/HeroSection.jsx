import { ArrowDown, ArrowUpRight, Download } from 'lucide-react'
import { profile } from '../data/siteData'

export default function HeroSection() {
  return (
    <section className="hero section-shell" id="home">
      <div className="hero-copy reveal">
        <div className="availability"><span className="pulse-dot" /> OPEN TO OJT / LEARNING OPPORTUNITIES</div>
        <p className="eyebrow">HELLO, I'M JEROME ANTONIO</p>
        <h1>Building for the<br /><span className="gradient-text">digital world.</span></h1>
        <p className="hero-role">{profile.role}</p>
        <p className="hero-description">{profile.intro}</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#portfolio">Explore My Projects <ArrowUpRight size={17} /></a>
          <button className="button button-secondary" type="button" onClick={() => window.alert("My CV is not available yet. Please check back soon.")}><Download size={16} /> CV Not Available Yet</button>
        </div>
        <div className="tech-line"><span>WORKING WITH</span><b>HTML</b><b>CSS</b><b>JavaScript</b><b>React</b></div>
      </div>
      <div className="hero-visual reveal">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" />
        <div className="profile-frame">
          <img src="/profile-placeholder.svg" alt="Jerome Antonio profile placeholder" />
          <div className="frame-label"><span>JA</span><small>FRONTEND DEVELOPER</small></div>
        </div>
        <div className="floating-card"><span className="floating-symbol">&lt;/&gt;</span><div><strong>Learning by building</strong><small>One project at a time</small></div></div>
        <div className="visual-index">01 <span> / 04</span></div>
      </div>
      <a href="#about" className="scroll-cue">SCROLL TO EXPLORE <ArrowDown size={15} /></a>
    </section>
  )
}
