import { ArrowUp, Github } from 'lucide-react'
import { profile } from '../data/siteData'

export default function Footer() {
  return <footer className="footer"><div className="container footer-inner"><a className="brand" href="#home">jerome<span>.dev</span></a><p>Designed and built with curiosity by {profile.name}.</p><a href="#home" className="back-top">BACK TO TOP <ArrowUp size={15} /></a></div><div className="footer-bottom">© 2026 {profile.name}. All rights reserved.</div></footer>
}
