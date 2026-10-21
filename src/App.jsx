import { useEffect, useRef, useState } from 'react'
import ControlPanel from './ui/ControlPanel'
import Stats from './ui/Stats'
import Toast from './ui/Toast'
import { startEngine } from './engine/Engine'
import { setupInput } from './engine/Input'
import { clampZoom, worldToScreen } from './engine/camera'
import { DESKTOP_MIN_WIDTH, ZONES, layoutZones } from './config/zones'
import { createThought, sizeFor } from './models/Thought'
import { burst, createWave } from './models/Particle'
import { decodeShare, encodeShare, hydrate, loadLocal, saveLocal, serialize } from './storage'

const MAX_TEXT = 80

// Shown on a first visit so the zones and opposite-attraction are visible right away
const SEED = [
  { text: 'wild idea', zone: 'creative' },
  { text: 'deep work', zone: 'focus' },
  { text: 'weekly plan', zone: 'organize' },
  { text: 'calm', zone: 'relax' },
  { text: 'happy' },
  { text: 'sad' },
  { text: 'chaos' },
]

function createState() {
  return {
    thoughts: [],
    particles: [],
    waves: [],
    bonds: [],
    zones: [],
    home: null,
    scale: 1,
    view: { width: 0, height: 0, dpr: 1 },
    camera: { x: 0, y: 0, zoom: 1 },
    pointer: null,
    hovered: null,
    selected: null,
    dragged: null,
    showLinks: false,
    reduceMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  }
}

export default function App() {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  stateRef.current ??= createState()
  const S = stateRef.current
  const params = useRef({ gravity: 0.5, chaos: 0.1, friction: 0.98, running: true }).current

  const [running, setRunning] = useState(true)
  const [stats, setStats] = useState({ thoughts: 0, particles: 0 })
  const [labels, setLabels] = useState([])
  const [zoom, setZoomState] = useState(1)
  const [showLinks, setShowLinks] = useState(false)
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth >= DESKTOP_MIN_WIDTH)
  const [toast, setToast] = useState(null)
  const [editing, setEditing] = useState(null)

  const showToast = (message, undo) => setToast({ message, undo, id: Date.now() })

  const spawnPoint = (zoneId) => {
    const zone = S.zones.find((z) => z.id === zoneId)
    const center = zone || S.home
    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * (zone ? zone.radius * 0.5 : 60)
    return { x: center.x + Math.cos(angle) * r, y: center.y + Math.sin(angle) * r }
  }

  const restore = (saved) => {
    S.thoughts = hydrate(saved, S.view, () => spawnPoint(null))
    for (const t of S.thoughts) t.size = sizeFor(t.text, S.scale)
    S.selected = S.hovered = null
  }

  const addThought = (rawText, zoneId) => {
    const text = rawText.trim().slice(0, MAX_TEXT)
    if (!text) return false
    const t = createThought({ ...spawnPoint(zoneId), text, zone: zoneId, scale: S.scale })
    S.thoughts.push(t)
    burst(S, t.x, t.y, t.color, 24, 5)
    if (!S.reduceMotion) S.waves.push(createWave(t.x, t.y, t.color, 300))
    return true
  }

  const removeThought = (t) => {
    const before = serialize(S.thoughts, S.view)
    S.thoughts = S.thoughts.filter((o) => o !== t)
    if (S.selected === t) S.selected = null
    if (S.hovered === t) S.hovered = null
    showToast(`Deleted “${t.text}”`, () => restore(before))
  }

  const clearAll = () => {
    if (!S.thoughts.length) return
    const before = serialize(S.thoughts, S.view)
    restore([])
    S.particles = []
    S.waves = []
    showToast('Cleared all thoughts', () => restore(before))
  }

  const setZoom = (z) => {
    S.camera.zoom = clampZoom(z)
    setZoomState(S.camera.zoom)
  }

  const resetView = () => {
    S.camera.x = S.camera.y = 0
    setZoom(1)
  }

  const togglePause = () => {
    params.running = !params.running
    setRunning(params.running)
  }

  const save = () => showToast(saveLocal(S.thoughts, S.view) ? '💾 Saved' : 'Could not save: storage is blocked')

  const share = async () => {
    const url = `${location.origin}${location.pathname}#t=${encodeShare(S.thoughts, S.view)}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('🔗 Share link copied')
    } catch {
      window.prompt('Copy this link', url)
    }
  }

  const exportImage = () => {
    const link = document.createElement('a')
    link.download = `mind-palace-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  const toggleLinks = () => {
    S.showLinks = !S.showLinks
    setShowLinks(S.showLinks)
  }

  const changeZone = (t, zone) => {
    t.zone = zone.id
    t.color = zone.color
    t.returnAt = 0
    burst(S, t.x, t.y, t.color, 16, 4)
    showToast(`Moved “${t.text}” to ${zone.icon} ${zone.name}`)
  }

  const startEdit = (t) => setEditing({ thought: t, text: t.text, ...worldToScreen(t, S) })

  const commitEdit = () => {
    const text = editing.text.trim().slice(0, MAX_TEXT)
    if (text && S.thoughts.includes(editing.thought)) {
      editing.thought.text = text
      editing.thought.size = sizeFor(text, S.scale)
    }
    setEditing(null)
  }

  // The input layer reads these at call time, so it always sees the latest closures
  const actions = useRef({}).current
  Object.assign(actions, {
    onEdit: startEdit,
    onDelete: removeThought,
    onZoneChange: changeZone,
    onZoom: setZoom,
    onSave: save,
    onTogglePause: togglePause,
  })

  // Canvas size, zone layout and the initial thoughts
  useEffect(() => {
    const canvas = canvasRef.current
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      S.view = { width, height, dpr }
      Object.assign(S, layoutZones(width, height))
      for (const t of S.thoughts) t.size = sizeFor(t.text, S.scale)
    }
    resize()
    window.addEventListener('resize', resize)

    if (!S.loaded) {
      S.loaded = true
      const shared = location.hash.startsWith('#t=') && decodeShare(location.hash.slice(3))
      const saved = loadLocal()
      if (shared) {
        restore(shared)
        history.replaceState(null, '', location.pathname + location.search)
        showToast('✨ Loaded a shared mind palace')
      } else if (saved) {
        restore(saved)
      } else {
        SEED.forEach((s) => addThought(s.text, s.zone))
      }
    }
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Autosave whenever the tab is hidden or closed
  useEffect(() => {
    const autosave = () => document.visibilityState === 'hidden' && saveLocal(S.thoughts, S.view)
    document.addEventListener('visibilitychange', autosave)
    window.addEventListener('pagehide', autosave)
    return () => {
      document.removeEventListener('visibilitychange', autosave)
      window.removeEventListener('pagehide', autosave)
    }
  }, [])

  useEffect(() => {
    const stopEngine = startEngine(canvasRef.current, S, params, () => {
      setStats((s) =>
        s.thoughts === S.thoughts.length && s.particles === S.particles.length
          ? s
          : { thoughts: S.thoughts.length, particles: S.particles.length },
      )
      setLabels((prev) => {
        const next = S.thoughts.map((t) => t.text)
        return next.join('\n') === prev.join('\n') ? prev : next
      })
    })
    const stopInput = setupInput(canvasRef.current, S, actions)
    return () => {
      stopEngine()
      stopInput()
    }
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        className="outline-none"
        aria-label={`Mind palace with ${stats.thoughts} thoughts. Tab selects a thought, arrows nudge it, Enter edits, Delete removes.`}
      />
      <ul className="sr-only">
        {labels.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>

      <ControlPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        zones={ZONES}
        onAdd={addThought}
        running={running}
        onTogglePause={togglePause}
        onClear={clearAll}
        zoom={zoom}
        onZoom={setZoom}
        onResetView={resetView}
        showLinks={showLinks}
        onToggleLinks={toggleLinks}
        onExport={exportImage}
        onShare={share}
        onSave={save}
      />
      <Stats {...stats} zoom={zoom} running={running} />

      {editing && (
        <input
          autoFocus
          aria-label="Edit thought"
          value={editing.text}
          maxLength={MAX_TEXT}
          onChange={(e) => setEditing({ ...editing, text: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Escape') e.currentTarget.dataset.cancel = '1'
            if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur()
          }}
          onBlur={(e) => (e.currentTarget.dataset.cancel ? setEditing(null) : commitEdit())}
          className="absolute w-52 -translate-x-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm text-center rounded-lg border border-purple-400 shadow-2xl focus:outline-none"
          style={{ left: editing.x, top: editing.y }}
        />
      )}
      {toast && <Toast key={toast.id} {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
