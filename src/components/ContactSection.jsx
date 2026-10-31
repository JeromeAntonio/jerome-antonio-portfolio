import { useState } from 'react'
import { Mail, MapPin, Phone, Github, Linkedin, Send, ArrowUpRight } from 'lucide-react'
import { profile } from '../data/siteData'

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [feedback, setFeedback] = useState('')
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setFeedback('Please complete all fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFeedback('Please enter a valid email address.')
      return
    }
    if (!profile.email || profile.email === 'your-email@example.com') {
      setFeedback('Please add your real email address in src/data/siteData.js before using the contact form.')
      return
    }
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`
    setFeedback('Your email app should open with the message prepared. Please send it from your email app.')
  }

  return (
    <section className="section-shell section-space contact-section" id="contact">
      <div className="section-heading centered reveal"><p className="eyebrow">HAVE A PROJECT IN MIND?</p><h2>Let's Work <span className="gradient-text">Together</span></h2><p>Have an opportunity, project, or idea in mind? I'd love to hear from you.</p></div>
      <div className="contact-layout">
        <aside className="contact-card reveal"><p className="eyebrow">GET IN TOUCH</p><h3>Let's start a<br />conversation.</h3><p>Feel free to reach out about OJT opportunities, collaboration, or just to say hello.</p>
          <div className="contact-detail"><span><Mail /></span><div><small>EMAIL</small><a href={`mailto:${profile.email}`}>{profile.email}</a></div></div>
          <div className="contact-detail"><span><Phone /></span><div><small>PHONE</small><strong>{profile.phone}</strong></div></div>
          <div className="contact-detail"><span><MapPin /></span><div><small>LOCATION</small><strong>{profile.location}</strong></div></div>
          <div className="social-row"><a href={profile.github} target="_blank" rel="noreferrer"><Github size={18} /> GitHub <ArrowUpRight size={14} /></a>{profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={18} /> LinkedIn <ArrowUpRight size={14} /></a>}</div>
        </aside>
        <form className="contact-form reveal" onSubmit={submit} noValidate><p className="eyebrow">SEND A MESSAGE</p><h3>Drop me a line.</h3>
          <div className="form-row"><label>Your name<input name="name" value={form.name} onChange={update} placeholder="John Doe" maxLength="80" /></label><label>Email address<input name="email" type="email" value={form.email} onChange={update} placeholder="john@email.com" maxLength="120" /></label></div>
          <label>Subject<input name="subject" value={form.subject} onChange={update} placeholder="How can I help?" maxLength="120" /></label>
          <label>Your message<textarea name="message" value={form.message} onChange={update} placeholder="Tell me a little about your idea..." rows="5" maxLength="2000" /></label>
          <button className="button button-primary submit-button" type="submit">Prepare Message <Send size={16} /></button>
          {feedback && <p className="form-feedback" role="status">{feedback}</p>}
        </form>
      </div>
    </section>
  )
}
