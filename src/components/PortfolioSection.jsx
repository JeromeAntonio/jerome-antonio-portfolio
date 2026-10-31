import { useState } from 'react'
import { ArrowUpRight, ExternalLink, Github, X, Layers3, Image as ImageIcon } from 'lucide-react'
import { projects, certificates, technologies } from '../data/portfolioData'

export default function PortfolioSection() {
  const [tab, setTab] = useState('Projects')
  const [selected, setSelected] = useState(null)
  const tabs = ['Projects', 'Certifications', 'Tech Stack']

  return (
    <section className="section-shell section-space" id="portfolio">
      <div className="section-heading centered reveal"><p className="eyebrow">SELECTED WORK & SKILLS</p><h2>Portfolio <span className="gradient-text">Showcase</span></h2><p>Explore my journey through projects, certifications, and technical expertise.</p></div>
      <div className="portfolio-tabs" role="tablist" aria-label="Portfolio categories">
        {tabs.map(item => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? 'selected' : ''} onClick={() => setTab(item)}>{item}</button>)}
      </div>

      {tab === 'Projects' && <div className="project-grid">
        {projects.map(project => <article className="project-card reveal" key={project.id}>
          <div className="project-image"><img src={project.image} alt={`${project.name} project preview`} onError={e => { e.currentTarget.style.display = 'none' }} /><div className="image-fallback"><Layers3 size={34} /><span>PROJECT PREVIEW</span></div><span className="project-status">{project.status}</span></div>
          <div className="project-body"><p className="eyebrow">{project.category}</p><h3>{project.name}</h3><p>{project.description}</p>
            <div className="tag-list">{project.technologies.map(t => <span key={t}>{t}</span>)}</div>
            <div className="card-actions"><button className="text-link" onClick={() => setSelected({ type: 'project', item: project })}>View Details <ArrowUpRight size={16} /></button>
              <div>{project.demo && <a href={project.demo} target="_blank" rel="noreferrer" aria-label="Live demo"><ExternalLink size={17} /></a>}{project.github && <a href={project.github} target="_blank" rel="noreferrer" aria-label="GitHub repository"><Github size={17} /></a>}</div>
            </div>
          </div>
        </article>)}
      </div>}

      {tab === 'Certifications' && <div className="certificate-grid">
        {certificates.map(cert => <article className="certificate-card reveal" key={cert.id}>
          <button className="certificate-image" onClick={() => setSelected({ type: 'certificate', item: cert })} aria-label={`View ${cert.name}`}><img src={cert.image} alt={cert.name} onError={e => { e.currentTarget.style.display = 'none' }} /><span className="certificate-fallback"><ImageIcon size={30} />ADD CERTIFICATE IMAGE</span></button>
          <div className="certificate-info"><p className="eyebrow">{cert.date}</p><h3>{cert.name}</h3><p>{cert.issuer}</p><button className="text-link" onClick={() => setSelected({ type: 'certificate', item: cert })}>View Certificate <ArrowUpRight size={16} /></button></div>
        </article>)}
      </div>}

      {tab === 'Tech Stack' && <div className="tech-grid">
        {technologies.map((tech, i) => <div className="tech-card reveal" key={tech.name}><span className={`tech-mark mark-${i % 5}`}>{tech.mark}</span><strong>{tech.name}</strong><small>{tech.category}</small></div>)}
      </div>}

      {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
        <div className="detail-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close details"><X /></button>
          {selected.type === 'project' ? <><p className="eyebrow">PROJECT DETAILS</p><h2>{selected.item.name}</h2><p>{selected.item.details}</p><h4>Key features</h4><ul>{selected.item.features.map(f => <li key={f}>{f}</li>)}</ul><h4>My contribution</h4><p>{selected.item.contribution}</p><div className="tag-list">{selected.item.technologies.map(t => <span key={t}>{t}</span>)}</div></> :
            <><p className="eyebrow">CERTIFICATE</p><h2>{selected.item.name}</h2><p>{selected.item.issuer} · {selected.item.date}</p><img className="modal-certificate" src={selected.item.image} alt={selected.item.name} /></>}
        </div>
      </div>}
    </section>
  )
}
