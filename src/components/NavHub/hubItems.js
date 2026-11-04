// Single source of truth for the hub's nodes.
// Titles / chips are derived from your existing data files, so the hub
// stays in sync when you edit src/data/siteData.js or portfolioData.js.
import { profile } from '../../data/siteData'
import { projects, technologies, certificates, experience } from '../../data/portfolioData'

const GITHUB_MAIN = profile.github || 'https://github.com/JeromeAntonio'
const GITHUB_ALT = 'https://github.com/LuckyOne67'

const shortCourse = (profile.course || '').replace('Bachelor of Science in ', 'BS ')
const exp = experience?.[0]
const projectTech = [...new Set(projects.flatMap((p) => p.technologies || []))]

const contactLinks = [
  { label: 'GitHub · JeromeAntonio', href: GITHUB_MAIN },
  { label: 'GitHub · LuckyOne67', href: GITHUB_ALT },
  profile.linkedin && { label: 'LinkedIn', href: profile.linkedin },
  profile.email && { label: 'Email', href: `mailto:${profile.email}` },
].filter(Boolean)

/**
 * section : id of the <section> to scroll to
 * tab     : (optional) Portfolio tab to open after arriving
 */
export const hubItems = [
  {
    id: 'home', index: '01', title: 'Home', kicker: 'START HERE',
    section: 'home', tab: null, color: '#9b8cff',
    tagline: profile.role,
    chips: ['Hero & introduction', profile.location].filter(Boolean),
  },
  {
    id: 'about', index: '02', title: 'About Me', kicker: 'WHO I AM',
    section: 'about', tab: null, color: '#70d9e8',
    tagline: profile.school,
    chips: [profile.year, shortCourse, 'Story & stats'].filter(Boolean),
  },
  {
    id: 'projects', index: '03', title: 'Projects', kicker: 'SELECTED WORK',
    section: 'portfolio', tab: 'Projects', color: '#e89bff',
    tagline: `${projects.length} featured project${projects.length === 1 ? '' : 's'}`,
    chips: [...projects.map((p) => p.name), ...projectTech],
  },
  {
    id: 'skills', index: '04', title: 'Tech Stack', kicker: 'SKILLS & TOOLS',
    section: 'portfolio', tab: 'Tech Stack', color: '#8de0b5',
    tagline: 'Technologies I build with',
    chips: technologies.map((t) => t.name),
  },
  {
    id: 'experience', index: '05', title: 'Experience', kicker: 'ORGANIZATIONS',
    section: 'experience', tab: null, color: '#f4d36e',
    tagline: exp ? `${exp.role} · ${exp.period}` : 'Leadership & involvement',
    chips: [exp?.role, 'SSITE', `${certificates.length} certifications`].filter(Boolean),
  },
  {
    id: 'contact', index: '06', title: 'Contact', kicker: "LET'S CONNECT",
    section: 'contact', tab: null, color: '#ff9a8b',
    tagline: profile.email || 'Say hello',
    chips: [],
    links: contactLinks,
  },
]
