import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { hubItems } from './hubItems'

// three.js + R3F are heavy → only downloaded when the hub is first opened.
const loadScene = () => import('./HubScene')
const HubScene = lazy(loadScene)

/** Start downloading the 3D code early (call on hover/focus of your own button) */
export const preloadNavHub = loadScene

/** Open the hub from anywhere (e.g. a Navbar button): openNavHub() */
export const openNavHub = () => window.dispatchEvent(new Event('navhub:open'))

const TOTAL = String(hubItems.length).padStart(2, '0')

const hexA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/* Scroll to a section (instantly — the portal is covering the screen), then
   switch the Portfolio tab if the node asked for one. */
function navigateTo(item) {
  if (item.tab) {
    const btn = [...document.querySelectorAll(`#${item.section} [role="tab"]`)].find(
      (b) => b.textContent.trim() === item.tab
    )
    btn?.click()
  }
  setTimeout(() => {
    if (item.section === 'home') window.scrollTo({ top: 0, behavior: 'instant' })
    else document.getElementById(item.section)?.scrollIntoView({ behavior: 'instant', block: 'start' })
    history.replaceState(null, '', item.section === 'home' ? location.pathname + location.search : `#${item.section}`)
  }, 0)
}

/* Falls back to a plain list if WebGL is missing or the 3D chunk fails to load */
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function HubList({ onEnter, onPreview }) {
  return (
    <div className="flex h-full flex-wrap content-center items-center justify-center gap-3 overflow-auto p-6">
      {hubItems.map((it, i) => (
        <button
          key={it.id}
          onClick={() => onEnter(i)}
          onMouseEnter={() => onPreview(i)}
          onFocus={() => onPreview(i)}
          className="min-w-[140px] cursor-pointer rounded-2xl border border-white/10 bg-white/[.04] px-5 py-4 text-left transition hover:bg-white/10"
          style={{ borderColor: hexA(it.color, 0.35) }}
        >
          <span className="block font-mono text-[10px] tracking-[.2em]" style={{ color: it.color }}>{it.index}</span>
          <span className="mt-1 block text-lg font-extrabold">{it.title}</span>
        </button>
      ))}
    </div>
  )
}

export default function NavHub({ hideLauncher = false }) {
  const reduce = useReducedMotion()
  const webgl = useMemo(hasWebGL, [])

  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [hover, setHover] = useState(null)
  const [warp, setWarp] = useState(false)
  const [portal, setPortal] = useState(null)

  const control = useRef(null)
  const overlayRef = useRef(null)
  const launcherRef = useRef(null)
  const activeRef = useRef(0)
  const busy = useRef(false)
  const timers = useRef([])

  const handleActive = useCallback((i) => { activeRef.current = i; setActive(i) }, [])
  const handleHover = useCallback((i) => setHover(i), [])

  const openHub = useCallback(() => {
    busy.current = false
    setHover(null)
    setWarp(false)
    setOpen(true)
  }, [])
  const closeHub = useCallback(() => setOpen(false), [])

  /* open from anywhere via window event */
  useEffect(() => {
    window.addEventListener('navhub:open', openHub)
    return () => window.removeEventListener('navhub:open', openHub)
  }, [openHub])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /* lock page scroll + manage focus while open */
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    overlayRef.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = prev
      // the launcher is unmounted while the hub is open, so wait for it to come back
      setTimeout(() => launcherRef.current?.focus?.({ preventScroll: true }), 350)
    }
  }, [open])

  /* click a node → dive + portal wipe → jump to the section → reveal */
  const enter = useCallback((i) => {
    if (busy.current) return
    busy.current = true
    const item = hubItems[i]
    setWarp(true)
    setPortal(item)
    const cover = reduce ? 350 : 1050
    timers.current.push(
      setTimeout(() => { navigateTo(item); setOpen(false); setWarp(false) }, cover),
      setTimeout(() => { setPortal(null); busy.current = false }, cover + 150)
    )
  }, [reduce])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') return closeHub()
    if (e.key === 'ArrowRight') return control.current?.step(1)
    if (e.key === 'ArrowLeft') return control.current?.step(-1)
    if (e.key === 'Enter' && e.target === overlayRef.current) return enter(activeRef.current)
    if (e.key === 'Tab') {
      // minimal focus trap
      const f = overlayRef.current.querySelectorAll('button, a[href]')
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === overlayRef.current)) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }
  }

  const shown = hubItems[hover ?? active]

  return (
    <>
      {/* ───────── launcher ───────── */}
      <AnimatePresence>
        {!hideLauncher && !open && (
          <motion.button
            ref={launcherRef}
            key="launcher"
            type="button"
            onClick={openHub}
            onMouseEnter={loadScene}
            onFocus={loadScene}
            onTouchStart={loadScene}
            aria-label="Open navigation hub"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-[60] flex cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-[#0c0d10]/80 py-2.5 pl-3 pr-5 font-mono text-[11px] tracking-[.16em] text-white shadow-[0_10px_40px_rgba(0,0,0,.45)] backdrop-blur-xl"
          >
            <span className="relative grid h-7 w-7 place-items-center">
              <span className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_0deg,#9b8cff,#70d9e8,#e89bff,#9b8cff)] [animation-duration:5s]" />
              <span className="absolute inset-[3px] rounded-full bg-[#0c0d10]" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]" />
            </span>
            EXPLORE
          </motion.button>
        )}
      </AnimatePresence>

      {/* ───────── overlay ───────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="hub"
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Portfolio navigation hub"
            tabIndex={-1}
            onKeyDown={onKeyDown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[90] flex select-none flex-col overflow-hidden bg-[#07080a] text-white outline-none"
          >
            {/* backgrounds: grid + colour bloom that follows the active node */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.027) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.027) 1px,transparent 1px)',
                backgroundSize: '42px 42px',
              }}
            />
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-[.22]"
              animate={{ backgroundColor: shown.color }}
              transition={{ duration: 0.6 }}
              style={{ maskImage: 'radial-gradient(ellipse at 50% 42%, #000, transparent 62%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 42%, #000, transparent 62%)' }}
            />

            {/* header */}
            <header className="relative z-10 flex items-center justify-between px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
              <span className="font-mono text-[15px] tracking-[.06em]">
                jerome<span className="text-[#9b8cff]">.dev</span>
              </span>
              <span className="hidden font-mono text-[10px] tracking-[.22em] text-[#969ba6] sm:block">
                DRAG · SCROLL · ← → TO ROTATE &nbsp;|&nbsp; CLICK TO ENTER
              </span>
              <button
                type="button"
                onClick={closeHub}
                aria-label="Close navigation hub"
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/5 p-0 text-white transition hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </header>

            {/* 3D stage */}
            <div className="relative min-h-0 flex-1 cursor-grab touch-none active:cursor-grabbing">
              <div className="absolute inset-0">
                {webgl ? (
                  <SceneBoundary fallback={<HubList onEnter={enter} onPreview={handleActive} />}>
                    <Suspense
                      fallback={
                        <div className="grid h-full place-items-center font-mono text-[10px] tracking-[.25em] text-[#969ba6]">
                          <span className="animate-pulse">OPENING PORTAL…</span>
                        </div>
                      }
                    >
                      <HubScene
                        items={hubItems}
                        control={control}
                        warp={warp}
                        reduced={!!reduce}
                        onActive={handleActive}
                        onHover={handleHover}
                        onSelect={enter}
                      />
                    </Suspense>
                  </SceneBoundary>
                ) : (
                  <HubList onEnter={enter} onPreview={handleActive} />
                )}
              </div>
              <p className="pointer-events-none absolute inset-x-0 bottom-1 text-center font-mono text-[9px] tracking-[.22em] text-[#6b707b] sm:hidden">
                SWIPE TO ROTATE · TAP TO ENTER
              </p>
            </div>

            {/* dots + arrows */}
            <nav aria-label="Hub sections" className="relative z-10 flex items-center justify-center gap-4 pb-2 pt-1">
              <button
                type="button"
                aria-label="Previous section"
                onClick={() => control.current?.step(-1)}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/5 p-0 text-white transition hover:bg-white/10"
              >
                <ChevronLeft size={16} />
              </button>
              <ul className="m-0 flex list-none items-center gap-2 p-0">
                {hubItems.map((it, i) => (
                  <li key={it.id}>
                    <button
                      type="button"
                      aria-label={`Go to ${it.title}`}
                      aria-current={active === i}
                      onClick={() => control.current?.goTo(i)}
                      className="block h-2 cursor-pointer rounded-full border-0 p-0 transition-all duration-300"
                      style={{
                        width: active === i ? 24 : 8,
                        background: active === i ? it.color : 'rgba(255,255,255,.22)',
                      }}
                    />
                  </li>
                ))}
              </ul>
              <button
                type="button"
                aria-label="Next section"
                onClick={() => control.current?.step(1)}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/5 p-0 text-white transition hover:bg-white/10"
              >
                <ChevronRight size={16} />
              </button>
            </nav>

            {/* info panel */}
            <section
              aria-live="polite"
              className="relative z-10 mx-auto flex h-[232px] w-full max-w-3xl flex-none flex-col items-center px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={shown.id}
                  initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                  animate={{ opacity: warp ? 0 : 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.28 }}
                  className="flex w-full flex-col items-center"
                >
                  <p className="m-0 font-mono text-[10px] tracking-[.22em]" style={{ color: shown.color }}>
                    {shown.index} / {TOTAL} · {shown.kicker}
                  </p>
                  <h2 className="m-0 mt-1.5 text-[34px] font-extrabold leading-none tracking-[-0.05em] sm:text-5xl">
                    {shown.title}
                  </h2>
                  <p className="m-0 mt-2 text-[13px] text-[#969ba6]">{shown.tagline}</p>

                  <ul className="m-0 mt-3 flex max-h-[66px] list-none flex-wrap justify-center gap-1.5 overflow-hidden p-0">
                    {shown.chips.map((c, i) => (
                      <li
                        key={c}
                        className={`rounded-full border px-2.5 py-1 font-mono text-[10px] text-[#d9d6ee] ${i >= 4 ? 'hidden sm:block' : ''}`}
                        style={{ borderColor: hexA(shown.color, 0.3), background: hexA(shown.color, 0.08) }}
                      >
                        {c}
                      </li>
                    ))}
                    {shown.links?.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          target={l.href.startsWith('mailto:') ? undefined : '_blank'}
                          rel="noreferrer"
                          className="block rounded-full border px-2.5 py-1 font-mono text-[10px] text-[#f3f4f6] transition hover:bg-white/10"
                          style={{ borderColor: hexA(shown.color, 0.45), background: hexA(shown.color, 0.1) }}
                        >
                          {l.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => enter(hubItems.indexOf(shown))}
                    className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-full border bg-white/[.04] px-6 text-xs font-bold tracking-wide text-white transition hover:bg-white/10"
                    style={{ borderColor: shown.color, boxShadow: `0 0 28px ${hexA(shown.color, 0.25)}` }}
                  >
                    Enter {shown.title}
                    <ArrowRight size={15} />
                  </button>
                </motion.div>
              </AnimatePresence>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────── portal wipe (outlives the overlay so it can cover the page jump) ───────── */}
      <AnimatePresence>
        {portal && (
          <motion.div
            key="portal"
            aria-hidden="true"
            className="fixed inset-0 z-[95] grid place-items-center"
            style={{ background: `radial-gradient(circle at 50% 50%, #ffffff 0%, ${portal.color} 16%, #0a0b10 64%)` }}
            initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 1 }}
            animate={{
              clipPath: 'circle(150% at 50% 50%)',
              transition: { duration: reduce ? 0.25 : 0.75, delay: reduce ? 0 : 0.25, ease: [0.7, 0, 0.2, 1] },
            }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: reduce ? 0 : 0.55, duration: 0.3 } }}
              className="font-mono text-[11px] tracking-[.35em] text-white mix-blend-difference"
            >
              ENTERING · {portal.title.toUpperCase()}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}