export const ZONES = [
  { id: 'creative', name: 'Creative Zone', color: '#ff6b9d', gravity: 0.2, chaos: 0.8, icon: '🎨' },
  { id: 'focus', name: 'Focus Zone', color: '#4ecdc4', gravity: 1.5, chaos: 0.05, icon: '🎯' },
  { id: 'organize', name: 'Organize Zone', color: '#95e1d3', gravity: 0.6, chaos: 0.2, icon: '📊' },
  { id: 'relax', name: 'Relax Zone', color: '#f38181', gravity: 0.1, chaos: 0.3, icon: '🌙' },
]

export const DESKTOP_MIN_WIDTH = 768
const PANEL_WIDTH = 380 // room for the control panel on desktop
const STATS_HEIGHT = 80 // room for the stats bar on mobile

// Lays the zones out in a 2x2 grid over the free part of the screen.
// Returns the zones, `home` (where free-floating thoughts drift to) and the bubble `scale`.
export function layoutZones(width, height) {
  const desktop = width >= DESKTOP_MIN_WIDTH
  const left = desktop ? PANEL_WIDTH : 0
  const top = desktop ? 0 : STATS_HEIGHT
  const cellW = (width - left) / 2
  const cellH = (height - top) / 2
  const radius = Math.max(45, Math.min(120, cellW * 0.38, cellH * 0.3))

  const zones = ZONES.map((z, i) => ({
    ...z,
    x: left + cellW * (0.5 + (i % 2)),
    y: top + cellH * (0.5 + Math.floor(i / 2)),
    radius,
  }))
  return { zones, home: { x: left + cellW, y: top + cellH }, scale: desktop ? 1 : 0.75 }
}
