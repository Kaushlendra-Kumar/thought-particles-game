import { Vector } from '../models/Vector'
import { burst } from '../models/Particle'
import { screenToWorld } from './camera'

const DOUBLE_TAP_MS = 350

// Pointer events cover mouse, touch and pen with one code path.
export function setupInput(canvas, state, cb) {
  let drag = null // { thought } or { panFrom: {x, y} }
  let last = null
  let lastMoveAt = 0
  let lastTap = { thought: null, at: 0 }

  const toWorld = (e) => {
    const r = canvas.getBoundingClientRect()
    return screenToWorld({ x: e.clientX - r.left, y: e.clientY - r.top }, state)
  }
  // Topmost (last drawn) thought under the point
  const hit = (p) => state.thoughts.findLast((t) => Vector.dist(p, t) <= t.size) || null

  const onDown = (e) => {
    canvas.setPointerCapture(e.pointerId)
    const p = toWorld(e)
    const t = hit(p)
    last = p
    lastMoveAt = performance.now()
    state.selected = t

    if (!t) {
      drag = { panFrom: { x: e.clientX, y: e.clientY } }
      canvas.style.cursor = 'move'
      return
    }
    if (lastTap.thought === t && performance.now() - lastTap.at < DOUBLE_TAP_MS) {
      lastTap = { thought: null, at: 0 }
      drag = null
      cb.onEdit(t)
      return
    }
    lastTap = { thought: t, at: performance.now() }
    drag = { thought: t }
    state.dragged = t
    t.glow = 1
    t.returnAt = 0
    t.vx = t.vy = 0
    canvas.style.cursor = 'grabbing'
    burst(state, t.x, t.y, t.color, 8, 3)
  }

  const onMove = (e) => {
    const p = toWorld(e)
    state.pointer = e.pointerType === 'mouse' ? p : null

    if (drag?.thought) {
      const t = drag.thought
      t.vx = p.x - last.x
      t.vy = p.y - last.y
      t.x = p.x
      t.y = p.y
      if (Math.hypot(t.vx, t.vy) > 5) t.breakBond = 10 // a fast drag tears it from its opposite
      if (Math.random() < 0.3) burst(state, p.x, p.y, t.color, 1, 2)
      lastMoveAt = performance.now()
    } else if (drag?.panFrom) {
      state.camera.x += (e.clientX - drag.panFrom.x) / state.camera.zoom
      state.camera.y += (e.clientY - drag.panFrom.y) / state.camera.zoom
      drag.panFrom = { x: e.clientX, y: e.clientY }
    } else {
      state.hovered = e.pointerType === 'mouse' ? hit(p) : null
      canvas.style.cursor = state.hovered ? 'grab' : 'default'
    }
    last = toWorld(e)
  }

  const onUp = () => {
    const t = drag?.thought
    drag = null
    state.dragged = null
    canvas.style.cursor = 'default'
    if (!t) return

    // Throw with momentum, unless the pointer was resting before release
    const resting = performance.now() - lastMoveAt > 80
    t.vx = resting ? 0 : t.vx * 2
    t.vy = resting ? 0 : t.vy * 2

    const dropZone = state.zones.find((z) => Vector.dist(t, z) < z.radius)
    if (dropZone) {
      if (t.zone !== dropZone.id) cb.onZoneChange(t, dropZone)
    } else if (t.zone) {
      // Wander for 5-10s (longer when thrown further) before drifting home
      const home = state.zones.find((z) => z.id === t.zone)
      const far = Math.min(Vector.dist(t, home) / Math.max(state.view.width, state.view.height), 1)
      t.returnAt = performance.now() + (5 + far * 5) * 1000
    }
  }

  const onLeave = () => {
    state.pointer = null
    state.hovered = null
  }

  const onWheel = (e) => {
    e.preventDefault()
    cb.onZoom(state.camera.zoom * (e.deltaY > 0 ? 0.9 : 1.1))
  }

  const onKey = (e) => {
    const typing = e.target.closest?.('input, textarea, select, button')
    const s = state.selected
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
      e.preventDefault()
      cb.onSave()
    } else if (typing) {
      return
    } else if (e.code === 'Space') {
      e.preventDefault()
      cb.onTogglePause()
    } else if ((e.code === 'Delete' || e.code === 'Backspace') && s) {
      e.preventDefault()
      cb.onDelete(s)
    } else if (e.code === 'Enter' && s) {
      cb.onEdit(s)
    } else if (e.code === 'Escape') {
      state.selected = null
    } else if (e.code === 'Tab' && e.target === canvas && state.thoughts.length) {
      // While the canvas has focus, Tab walks through thoughts, then moves on as usual
      const i = state.thoughts.indexOf(s)
      const next = i + (e.shiftKey ? -1 : 1)
      if (i === -1 || (next >= 0 && next < state.thoughts.length)) {
        e.preventDefault()
        state.selected = state.thoughts[i === -1 ? (e.shiftKey ? state.thoughts.length - 1 : 0) : next]
      } else {
        state.selected = null
      }
    } else if (s && e.code.startsWith('Arrow')) {
      e.preventDefault()
      const push = { ArrowUp: [0, -3], ArrowDown: [0, 3], ArrowLeft: [-3, 0], ArrowRight: [3, 0] }[e.code]
      s.vx += push[0]
      s.vy += push[1]
    }
  }

  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)
  canvas.addEventListener('pointerleave', onLeave)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKey)

  return () => {
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onUp)
    canvas.removeEventListener('pointerleave', onLeave)
    canvas.removeEventListener('wheel', onWheel)
    window.removeEventListener('keydown', onKey)
  }
}
