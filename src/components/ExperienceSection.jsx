import { BriefcaseBusiness, Trophy } from 'lucide-react'
import { experience } from '../data/portfolioData'

export default function ExperienceSection() {
  return (
    <section className="section-shell section-space" id="experience">
      <div className="section-heading reveal"><p className="eyebrow">BEYOND THE CLASSROOM</p><h2>Experience & <span className="muted-heading">Activities</span></h2><p>Learning through collaboration, responsibility, and student involvement.</p></div>
      <div className="experience-list">
        {experience.map((item, i) => <article className="experience-card reveal" key={item.organization}>
          <div className="experience-icon"><BriefcaseBusiness /></div>
          <div className="experience-main"><div className="experience-top"><div><p className="eyebrow">{item.period}</p><h3>{item.role}</h3><p className="experience-org">{item.organization}</p></div><span className="experience-number">0{i + 1}</span></div>
            <p>{item.description}</p><ul>{item.responsibilities.map(r => <li key={r}>{r}</li>)}</ul>
            <div className="achievement-note"><Trophy size={18} /><span>{item.achievement}</span></div>
          </div>
        </article>)}
      </div>
    </section>
  )
}
