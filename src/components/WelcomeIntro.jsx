import { useEffect, useState } from 'react'
import { Code2 } from 'lucide-react'

export default function WelcomeIntro() {
  const [visible, setVisible] = useState(!sessionStorage.getItem('portfolio-intro-seen'))

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('portfolio-intro-seen', 'yes')
    }, 2300)
    return () => window.clearTimeout(timer)
  }, [visible])

  if (!visible) return null

  return (
    <div className="welcome-screen" aria-label="Welcome to my portfolio">
      <div className="welcome-content">
        <div className="welcome-icons"><span><Code2 size={19} /></span><span>JA.</span><span>✳</span></div>
        <p className="eyebrow">PERSONAL DEVELOPER PORTFOLIO</p>
        <h1>Welcome to My<br /><span>Portfolio</span></h1>
        <p className="welcome-subtitle">Exploring ideas, building experiences, and developing modern web solutions.</p>
        <div className="welcome-loader"><span /></div>
      </div>
    </div>
  )
}
