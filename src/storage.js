import { createThought } from './models/Thought'

const KEY = 'mindPalaceState'

const round3 = (n) => Math.round(n * 1000) / 1000

// Positions are stored as fractions of the screen so a layout fits any screen size.
export const serialize = (thoughts, view) =>
  thoughts.map(({ text, zone, color, x, y }) => ({
    text,
    zone,
    color,
    fx: round3(x / view.width),
    fy: round3(y / view.height),
  }))

// Also accepts older saves that stored absolute x/y.
export function hydrate(list, view, fallback) {
  if (!Array.isArray(list)) return []
  const position = (d) => {
    if (Number.isFinite(d.fx) && Number.isFinite(d.fy)) return { x: d.fx * view.width, y: d.fy * view.height }
    if (Number.isFinite(d.x) && Number.isFinite(d.y)) return { x: d.x, y: d.y }
    return fallback()
  }
  return list
    .filter((d) => typeof d?.text === 'string' && d.text.trim())
    .map((d) => createThought({ ...d, ...position(d), text: d.text.slice(0, 80) }))
}

export function saveLocal(thoughts, view) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ thoughts: serialize(thoughts, view) }))
    return true
  } catch {
    return false
  }
}

export function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(KEY))?.thoughts ?? null
  } catch {
    return null
  }
}

// Share links carry the layout in the URL hash as unicode-safe base64url JSON.
export function encodeShare(thoughts, view) {
  const bytes = new TextEncoder().encode(JSON.stringify(serialize(thoughts, view)))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeShare(code) {
  try {
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))))
  } catch {
    return null
  }
}
