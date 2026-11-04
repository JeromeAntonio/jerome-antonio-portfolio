import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/* ────────────────────────────────────────────────────────────────────────────
   helpers
──────────────────────────────────────────────────────────────────────────── */
const TAU = Math.PI * 2
const mod = (n, m) => ((n % m) + m) % m
const damp = THREE.MathUtils.damp
const _c = new THREE.Color()

const hexA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

function roundRectPath(g, x, y, w, h, r) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

/* Simple line icons, drawn around (0,0) in a ~120px box */
const ICONS = {
  home: (g) => {
    g.beginPath()
    g.moveTo(-60, 0); g.lineTo(0, -55); g.lineTo(60, 0)
    g.moveTo(-42, -12); g.lineTo(-42, 50); g.lineTo(42, 50); g.lineTo(42, -12)
    g.moveTo(-14, 50); g.lineTo(-14, 14); g.lineTo(14, 14); g.lineTo(14, 50)
    g.stroke()
  },
  about: (g) => {
    g.beginPath()
    g.arc(0, -26, 26, 0, TAU)
    g.moveTo(-54, 56); g.quadraticCurveTo(-54, 12, 0, 12); g.quadraticCurveTo(54, 12, 54, 56)
    g.stroke()
  },
  projects: (g) => {
    g.beginPath()
    g.rect(-56, -34, 84, 72)
    g.moveTo(-30, -52); g.lineTo(56, -52); g.lineTo(56, 18)
    g.stroke()
  },
  skills: (g) => {
    g.beginPath()
    g.moveTo(-22, -36); g.lineTo(-58, 0); g.lineTo(-22, 36)
    g.moveTo(22, -36); g.lineTo(58, 0); g.lineTo(22, 36)
    g.moveTo(10, -46); g.lineTo(-10, 46)
    g.stroke()
  },
  experience: (g) => {
    g.beginPath()
    g.rect(-58, -22, 116, 76)
    g.moveTo(-22, -22); g.lineTo(-22, -40); g.lineTo(22, -40); g.lineTo(22, -22)
    g.moveTo(-58, 10); g.lineTo(58, 10)
    g.stroke()
  },
  contact: (g) => {
    g.beginPath()
    g.rect(-60, -38, 120, 76)
    g.moveTo(-60, -38); g.lineTo(0, 6); g.lineTo(60, -38)
    g.stroke()
  },
}

function makeTileTexture(item, total, anisotropy) {
  const W = 512
  const H = 700
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')

  // card body
  g.save()
  roundRectPath(g, 6, 6, W - 12, H - 12, 44)
  g.clip()
  const bg = g.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#1b1d24')
  bg.addColorStop(1, '#0b0c10')
  g.fillStyle = bg
  g.fillRect(0, 0, W, H)
  const wash = g.createRadialGradient(W / 2, H * 0.38, 10, W / 2, H * 0.38, 300)
  wash.addColorStop(0, hexA(item.color, 0.3))
  wash.addColorStop(1, hexA(item.color, 0))
  g.fillStyle = wash
  g.fillRect(0, 0, W, H)
  g.restore()

  // border
  roundRectPath(g, 6, 6, W - 12, H - 12, 44)
  g.lineWidth = 3
  g.strokeStyle = hexA(item.color, 0.6)
  g.stroke()

  // index label
  g.fillStyle = '#9297a3'
  g.font = '500 26px "DM Mono", monospace'
  g.textAlign = 'left'
  g.fillText(`${item.index} / ${String(total).padStart(2, '0')}`, 46, 78)

  // portal motif + icon
  const cx = W / 2
  const cy = H * 0.4
  g.lineWidth = 2
  g.strokeStyle = hexA(item.color, 0.22)
  g.beginPath(); g.arc(cx, cy, 150, 0, TAU); g.stroke()
  g.strokeStyle = hexA(item.color, 0.4)
  g.beginPath(); g.arc(cx, cy, 112, 0, TAU); g.stroke()
  g.save()
  g.translate(cx, cy)
  g.scale(1.25, 1.25)
  g.lineWidth = 4.5
  g.lineCap = 'round'
  g.lineJoin = 'round'
  g.strokeStyle = item.color
  ;(ICONS[item.id] || ICONS.home)(g)
  g.restore()

  // title + kicker
  g.textAlign = 'center'
  g.fillStyle = '#ffffff'
  g.font = '800 58px Manrope, sans-serif'
  g.fillText(item.title, W / 2, H - 126)
  g.fillStyle = item.color
  g.font = '500 22px "DM Mono", monospace'
  g.fillText(item.kicker, W / 2, H - 78)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = anisotropy
  return tex
}

/* soft rounded-rect halo (hollow in the middle so it never washes out the tile) */
function makeHaloTexture() {
  const S = 256
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  const g = c.getContext('2d')
  g.shadowColor = '#fff'
  g.shadowBlur = 34
  g.fillStyle = '#fff'
  roundRectPath(g, 44, 44, S - 88, S - 88, 24)
  g.fill()
  g.shadowBlur = 0
  g.globalCompositeOperation = 'destination-out'
  roundRectPath(g, 37, 37, S - 74, S - 74, 20)
  g.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function makeRadialTexture() {
  const S = 256
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.35, 'rgba(255,255,255,0.35)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, S, S)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function useFontsReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let on = true
    const f = document.fonts
    if (!f?.load) { setReady(true); return }
    Promise.all([f.load('800 58px Manrope'), f.load('500 22px "DM Mono"')])
      .catch(() => {})
      .finally(() => on && setReady(true))
    return () => { on = false }
  }, [])
  return ready
}

/* ────────────────────────────────────────────────────────────────────────────
   one tile on the ring
──────────────────────────────────────────────────────────────────────────── */
function Tile({ item, i, step, radius, w, h, tex, halo, st, onHover, onTile }) {
  const group = useRef()
  const front = useRef()
  const back = useRef()
  const glow = useRef()
  const theta = i * step

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = st.current
    const facing = Math.cos(theta + s.rot) // 1 = facing camera, -1 = facing away
    const k = THREE.MathUtils.smoothstep(facing, -0.35, 0.95)
    const hov = s.hover === i ? 1 : 0

    const scale = 0.86 + 0.14 * k + hov * 0.05
    group.current.scale.setScalar(damp(group.current.scale.x, scale, 8, dt))
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.9 + i * 1.3) * 0.06

    front.current.material.opacity = 0.32 + 0.68 * k
    back.current.material.opacity = 0.5 * (0.35 + 0.65 * k)
    glow.current.material.opacity = Math.min(1, Math.pow(Math.max(facing, 0), 6) * 0.95 + hov * 0.4)
  })

  return (
    <group position={[Math.sin(theta) * radius, 0, Math.cos(theta) * radius]} rotation={[0, theta, 0]}>
      <group ref={group}>
        <mesh ref={glow} position={[0, 0, -0.03]} scale={[1.36, 1.3, 1]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial
            map={halo}
            color={item.color}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={back} position={[0, 0, -0.012]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color="#0d0e13" transparent toneMapped={false} />
        </mesh>
        <mesh
          ref={front}
          onPointerOver={(e) => { e.stopPropagation(); onHover(i) }}
          onPointerOut={() => onHover(null)}
          onClick={(e) => {
            e.stopPropagation()
            if (e.delta > 6) return // it was a drag, not a tap
            onTile(i)
          }}
        >
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   the whole scene
──────────────────────────────────────────────────────────────────────────── */
function Scene({ items, control, warp, reduced, onActive, onHover, onSelect }) {
  const get = useThree((s) => s.get)
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)

  const N = items.length
  const STEP = TAU / N
  const narrow = size.width < 640
  const R = narrow ? 2.4 : 3.5
  const tileW = narrow ? 1.55 : 2.0
  const tileH = narrow ? 2.1 : 2.7
  const camZ = R + (narrow ? 5.9 : 5.2)
  const camY = narrow ? 0.9 : 1.1

  // mutable animation state (never triggers React renders)
  const st = useRef({
    rot: 0, target: 0, vel: 0,
    drag: false, lastX: 0, lastT: 0,
    idx: 0, lastWheel: 0, hover: null,
    warp: 0, cx: 0, cy: 0,
    color: new THREE.Color(items[0].color),
  })
  const warpRef = useRef(warp)
  warpRef.current = warp
  const cbs = useRef({})
  cbs.current = { onActive, onHover, onSelect }

  const ring = useRef()
  const orb = useRef()
  const orbMat = useRef()
  const wire = useRef()
  const backdrop = useRef()
  const rA = useRef()
  const rB = useRef()
  const rC = useRef()

  /* textures + shared materials */
  const fontsReady = useFontsReady()
  const aniso = gl.capabilities.getMaxAnisotropy()
  const tiles = useMemo(
    () => items.map((it) => makeTileTexture(it, N, aniso)),
    [items, N, aniso, fontsReady] // eslint-disable-line react-hooks/exhaustive-deps
  )
  useEffect(() => () => tiles.forEach((t) => t.dispose()), [tiles])

  const halo = useMemo(makeHaloTexture, [])
  const radial = useMemo(makeRadialTexture, [])
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55, toneMapped: false }), [])
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.28, toneMapped: false }), [])
  const glowMat = useMemo(
    () => new THREE.SpriteMaterial({ map: radial, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    [radial]
  )
  useEffect(() => () => { halo.dispose(); radial.dispose(); ringMat.dispose(); wireMat.dispose(); glowMat.dispose() }, [halo, radial, ringMat, wireMat, glowMat])

  /* imperative API for the DOM layer (arrows, dots, keyboard) */
  useEffect(() => {
    control.current = {
      goTo(i) {
        const s = st.current
        const cur = Math.round(-s.target / STEP)
        let d = mod(i - cur, N)
        if (d > N / 2) d -= N
        s.target -= d * STEP
      },
      step(dir) {
        const s = st.current
        s.target = Math.round(s.target / STEP) * STEP - dir * STEP
      },
    }
    return () => { control.current = null }
  }, [control, STEP, N])

  /* drag / touch / wheel */
  useEffect(() => {
    const el = gl.domElement
    const s = st.current

    // pixels → radians so the front tile tracks the finger 1:1
    const radPerPx = () => {
      const { viewport, camera, size: sz } = get()
      return viewport.getCurrentViewport(camera, [0, 0, R]).width / sz.width / R
    }

    const down = (e) => {
      if (warpRef.current) return
      s.drag = true
      s.lastX = e.clientX
      s.lastT = performance.now()
      s.vel = 0
      el.style.cursor = 'grabbing'
    }
    const move = (e) => {
      if (!s.drag) return
      const now = performance.now()
      const dt = Math.max(8, now - s.lastT) / 1000
      const d = (e.clientX - s.lastX) * radPerPx()
      s.target += d
      s.vel = s.vel * 0.6 + (d / dt) * 0.4
      s.lastX = e.clientX
      s.lastT = now
    }
    const up = () => {
      if (!s.drag) return
      s.drag = false
      el.style.cursor = s.hover != null ? 'pointer' : ''
      const stale = performance.now() - s.lastT > 90
      const v = stale ? 0 : THREE.MathUtils.clamp(s.vel, -9, 9)
      s.target += v * 0.22 // fling…
      s.target = Math.round(s.target / STEP) * STEP // …then snap to a tile
      s.vel = 0
    }
    const wheel = (e) => {
      e.preventDefault()
      if (warpRef.current) return
      const now = performance.now()
      if (now - s.lastWheel < 380) return
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(delta) < 8) return
      s.lastWheel = now
      control.current?.step(delta > 0 ? 1 : -1)
    }

    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
    }
  }, [gl, get, R, STEP, control])

  const hover = (i) => {
    st.current.hover = i
    gl.domElement.style.cursor = i == null ? '' : 'pointer'
    cbs.current.onHover(i)
  }
  const tapTile = (i) => {
    if (warpRef.current) return
    const target = mod(Math.round(-st.current.target / STEP), N)
    if (i === target) cbs.current.onSelect(i)
    else control.current?.goTo(i)
  }

  /* per-frame animation */
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = st.current
    const t = state.clock.elapsedTime
    const camera = state.camera

    // ring rotation (damped toward target; stiffer while dragging)
    s.rot = damp(s.rot, s.target, s.drag ? 22 : 5, dt)
    ring.current.rotation.y = s.rot

    const idx = mod(Math.round(-s.rot / STEP), N)
    if (idx !== s.idx) { s.idx = idx; cbs.current.onActive(idx) }

    // warp progress 0 → 1 (dive into the portal)
    s.warp = damp(s.warp, warpRef.current && !reduced ? 1 : 0, 2.6, dt)
    const w = s.warp
    const e = w * w * (3 - 2 * w)

    // tint everything with the active section colour
    _c.set(items[idx].color)
    s.color.lerp(_c, 1 - Math.exp(-6 * dt))
    orbMat.current.color.copy(s.color)
    orbMat.current.emissive.copy(s.color)
    ringMat.color.copy(s.color)
    wireMat.color.copy(s.color)
    glowMat.color.copy(s.color)
    glowMat.opacity = 0.45 + w * 0.5

    // portal core
    orb.current.scale.setScalar(1 + w * 7)
    orb.current.rotation.y = t * 0.3
    wire.current.scale.setScalar(1 + w * 6)
    wire.current.rotation.set(t * 0.2, t * 0.35, 0)

    // backdrop rings
    rA.current.rotation.z = t * 0.25
    rB.current.rotation.z = -t * 0.18
    rC.current.rotation.z = t * 0.4
    backdrop.current.scale.setScalar(1 + w * 0.6)

    // camera: gentle pointer parallax, then a dive through the front tile
    const px = reduced ? 0 : state.pointer.x
    const py = reduced ? 0 : state.pointer.y
    s.cx = damp(s.cx, px * 0.45, 3, dt)
    s.cy = damp(s.cy, py * 0.25, 3, dt)
    camera.position.set(s.cx * (1 - w), (camY + s.cy) * (1 - w), THREE.MathUtils.lerp(camZ, 0.2, e))
    camera.fov = 45 + 50 * e
    camera.updateProjectionMatrix()
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 3, 4]} intensity={1.5} />
      {!reduced && <Sparkles count={70} scale={[12, 6, 12]} size={3} speed={0.35} opacity={0.7} color="#b7aaff" />}

      {/* backdrop portal (seen around + behind the active tile) */}
      <group ref={backdrop} position={[0, 0, -(R + 1.3)]}>
        <sprite material={glowMat} scale={[16, 16, 1]} />
        <mesh ref={rA} material={ringMat}><torusGeometry args={[4.2, 0.014, 12, 200]} /></mesh>
        <mesh ref={rB} material={ringMat}><torusGeometry args={[5.0, 0.01, 12, 200]} /></mesh>
        <mesh ref={rC} material={ringMat}><torusGeometry args={[3.5, 0.035, 12, 200, Math.PI * 1.2]} /></mesh>
      </group>

      {/* energy core at the ring's centre — peeks through between tiles, becomes the dive target */}
      <mesh ref={orb}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <MeshDistortMaterial
          ref={orbMat}
          distort={0.35}
          speed={reduced ? 0 : 2}
          roughness={0.25}
          metalness={0.2}
          emissiveIntensity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={wire} material={wireMat}><icosahedronGeometry args={[1.1, 1]} /></mesh>

      {/* the carousel ring */}
      <group ref={ring}>
        {items.map((item, i) => (
          <Tile
            key={item.id}
            item={item}
            i={i}
            step={STEP}
            radius={R}
            w={tileW}
            h={tileH}
            tex={tiles[i]}
            halo={halo}
            st={st}
            onHover={hover}
            onTile={tapTile}
          />
        ))}
      </group>
    </>
  )
}

export default function HubScene(props) {
  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      camera={{ fov: 45, near: 0.1, far: 80, position: [0, 1.1, 9] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'none' }}
    >
      <Scene {...props} />
    </Canvas>
  )
}
