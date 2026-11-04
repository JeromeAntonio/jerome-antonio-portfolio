import { useEffect } from 'react'
import WelcomeIntro from './components/WelcomeIntro'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import PortfolioSection from './components/PortfolioSection'
import ExperienceSection from './components/ExperienceSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import NavHub from './components/NavHub/NavHub'

export default function App() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.01, rootMargin: '0px 0px -4% 0px' })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return <>
    <WelcomeIntro />
    <div className="site-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <PortfolioSection />
        <ExperienceSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
    <NavHub hideLauncher />
  </>
}