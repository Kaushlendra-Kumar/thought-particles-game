import { ZONES } from '../config/zones'

// Bubble radius grows with the text so short words stay small; `scale` shrinks it on phones.
export const sizeFor = (text, scale = 1) => Math.max(30, Math.min(60, 16 + text.length * 4)) * scale

export function createThought({ x, y, text, zone = null, color, scale = 1 }) {
  const home = ZONES.find((z) => z.id === zone)
  return {
    id: Math.random().toString(36).slice(2),
    x,
    y,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    text,
    size: sizeFor(text, scale),
    color: home?.color || color || `hsl(${Math.floor(Math.random() * 360)},70%,60%)`,
    zone: home ? zone : null,
    glow: 0,
    breakBond: 0,
    returnAt: 0,
  }
}
