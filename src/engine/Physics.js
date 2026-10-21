import { Vector } from '../models/Vector'
import { burst } from '../models/Particle'

export const ANTONYM_PAIRS = [
  ['sad', 'happy'],
  ['chaos', 'calm'],
  ['chaos', 'peace'],
  ['angry', 'peaceful'],
  ['dark', 'light'],
  ['stress', 'relax'],
  ['fear', 'brave'],
  ['hate', 'love'],
  ['good', 'bad'],
  ['hope', 'despair'],
  ['start', 'end'],
  ['past', 'future'],
  ['दुख', 'सुख'],
  ['डर', 'हिम्मत'],
  ['नफरत', 'प्यार'],
]

const wordCache = new Map()
function wordsOf(text) {
  let words = wordCache.get(text)
  if (!words) {
    // \p{M} keeps Devanagari vowel signs attached to their word
    words = new Set(text.toLowerCase().match(/[\p{L}\p{M}]+/gu))
    wordCache.set(text, words)
  }
  return words
}

// Whole-word match, so "delight" does not pair with "dark".
export function areAntonyms(a, b) {
  const wa = wordsOf(a)
  const wb = wordsOf(b)
  return ANTONYM_PAIRS.some(
    ([x, y]) => (wa.has(x) && wb.has(y)) || (wa.has(y) && wb.has(x)),
  )
}

export function findBonds(thoughts) {
  const bonds = []
  for (let i = 0; i < thoughts.length; i++) {
    for (let j = i + 1; j < thoughts.length; j++) {
      if (areAntonyms(thoughts[i].text, thoughts[j].text)) bonds.push([thoughts[i], thoughts[j]])
    }
  }
  return bonds
}

function pull(t, target, strength) {
  const d = Vector.sub(target, t)
  const dist = Vector.mag(d)
  if (dist > 10) {
    t.vx += (d.x / dist) * strength
    t.vy += (d.y / dist) * strength
  }
}

// `f` is elapsed time in 60fps frames.
export function updatePhysics(state, params, f = 1, now = performance.now()) {
  const { thoughts, zones, view } = state
  const friction = Math.pow(params.friction, f)

  for (const t of thoughts) {
    t.breakBond = Math.max(0, t.breakBond - f)
    t.glow = Math.max(0, t.glow - 0.02 * f)
    if (t === state.dragged) continue

    const zone = t.zone && zones.find((z) => z.id === t.zone)
    let chaos = params.chaos
    if (zone && now < t.returnAt) {
      chaos = zone.chaos * 1.5 // wanders freely before heading home
    } else if (zone) {
      chaos = zone.chaos
      pull(t, zone, zone.gravity * 0.1 * f)
    } else if (state.pointer && Vector.dist(state.pointer, t) < 220) {
      pull(t, state.pointer, params.gravity * 0.15 * f) // the cursor acts as a magnet
    } else if (state.home) {
      pull(t, state.home, params.gravity * 0.05 * f)
    }

    t.vx = (t.vx + (Math.random() - 0.5) * chaos * f) * friction
    t.vy = (t.vy + (Math.random() - 0.5) * chaos * f) * friction
    t.x += t.vx * f
    t.y += t.vy * f
  }

  // Opposite thoughts attract each other
  state.bonds = findBonds(thoughts)
  for (const [a, b] of state.bonds) {
    if (a.breakBond > 0 || b.breakBond > 0) continue
    const dist = Vector.dist(a, b)
    if (dist >= 300 || dist <= a.size + b.size) continue
    const s = 0.5 * (1 - dist / 300) * f
    const dx = (b.x - a.x) / dist
    const dy = (b.y - a.y) / dist
    if (a !== state.dragged) {
      a.vx += dx * s
      a.vy += dy * s
    }
    if (b !== state.dragged) {
      b.vx -= dx * s
      b.vy -= dy * s
    }
    a.glow = b.glow = 0.6
  }

  // Collisions
  for (let i = 0; i < thoughts.length; i++) {
    for (let j = i + 1; j < thoughts.length; j++) {
      const a = thoughts[i]
      const b = thoughts[j]
      const dist = Vector.dist(a, b)
      const overlap = a.size + b.size - dist
      if (overlap <= 0 || dist === 0) continue

      const nx = (a.x - b.x) / dist
      const ny = (a.y - b.y) / dist
      a.x += nx * overlap * 0.5
      a.y += ny * overlap * 0.5
      b.x -= nx * overlap * 0.5
      b.y -= ny * overlap * 0.5

      const impact = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
      if (impact <= 0) continue // already separating
      ;[a.vx, b.vx] = [b.vx * 0.8, a.vx * 0.8]
      ;[a.vy, b.vy] = [b.vy * 0.8, a.vy * 0.8]
      a.glow = b.glow = 0.5
      if (impact > 2) burst(state, (a.x + b.x) / 2, (a.y + b.y) / 2, a.color, 4, 2)
    }
  }

  // Keep thoughts inside the world
  for (const t of thoughts) {
    if (t.x < t.size || t.x > view.width - t.size) {
      t.x = Math.min(Math.max(t.x, t.size), view.width - t.size)
      t.vx *= -0.7
    }
    if (t.y < t.size || t.y > view.height - t.size) {
      t.y = Math.min(Math.max(t.y, t.size), view.height - t.size)
      t.vy *= -0.7
    }
  }
}
