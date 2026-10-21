import { renderParticles, renderWaves } from '../models/Particle'

const FONT = '600 13px Inter, sans-serif'
const CHAR_WIDTH = 7.5 // rough average width of FONT

// How much of the text fits inside the bubble; the rest is shown on hover.
export function labelFor(t) {
  const max = Math.floor((t.size * 2 - 12) / CHAR_WIDTH)
  return t.text.length > max ? t.text.slice(0, max - 1) + '…' : t.text
}

function drawBackground(ctx, { width, height }, now) {
  const g = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
  g.addColorStop(0, '#0f1729')
  g.addColorStop(1, '#0a0e1a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 150; i++) {
    ctx.globalAlpha = Math.sin(now * 0.0001 + i * 0.5) * 0.3 + 0.5
    const size = (i % 3) * 0.5 + 0.5
    ctx.fillRect((i * 157.3) % width, (i * 211.7) % height, size, size)
  }
  ctx.globalAlpha = 1
}

function drawZone(ctx, z, now) {
  const g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.radius * 1.5)
  g.addColorStop(0, `${z.color}40`)
  g.addColorStop(0.5, `${z.color}20`)
  g.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(z.x, z.y, z.radius * 1.3, 0, Math.PI * 2)
  ctx.fill()

  const pulse = Math.sin(now * 0.001 + z.x) * 0.3 + 0.7
  ctx.strokeStyle = z.color
  ctx.shadowColor = z.color
  ctx.shadowBlur = 20
  ctx.lineWidth = 4
  ctx.globalAlpha = pulse
  ctx.setLineDash([10, 10])
  ctx.beginPath()
  ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = pulse * 0.6
  ctx.beginPath()
  ctx.arc(z.x, z.y, z.radius + 8, 0, Math.PI * 2)
  ctx.stroke()

  ctx.globalAlpha = 0.9
  ctx.fillStyle = z.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${Math.round(z.radius * 0.4)}px sans-serif`
  ctx.fillText(z.icon, z.x, z.y)
  ctx.shadowBlur = 8
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 16px Inter, sans-serif'
  ctx.fillText(z.name, z.x, z.y + z.radius + 26)
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
}

function drawLinks(ctx, state) {
  ctx.lineWidth = 2
  // Thoughts that share a zone
  for (const z of state.zones) {
    const members = state.thoughts.filter((t) => t.zone === z.id)
    ctx.strokeStyle = z.color
    ctx.globalAlpha = 0.25
    ctx.beginPath()
    members.forEach((t, i) => {
      for (const o of members.slice(i + 1)) {
        ctx.moveTo(t.x, t.y)
        ctx.lineTo(o.x, o.y)
      }
    })
    ctx.stroke()
  }
  // Opposite thoughts
  ctx.globalAlpha = 0.8
  ctx.strokeStyle = '#ffd36b'
  ctx.setLineDash([6, 6])
  ctx.beginPath()
  for (const [a, b] of state.bonds) {
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
  }
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 1
}

function drawThought(ctx, t, selected) {
  const speed = Math.hypot(t.vx, t.vy)

  if (speed > 1) {
    ctx.fillStyle = t.color
    ctx.globalAlpha = 0.15
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath()
      ctx.arc(t.x - t.vx * i * 3, t.y - t.vy * i * 3, t.size * 0.85, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const glow = Math.max(t.glow, Math.min(speed * 0.4, 0.7))
  if (glow > 0) {
    const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.size * 2)
    g.addColorStop(0, t.color)
    g.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = g
    ctx.globalAlpha = glow
    ctx.beginPath()
    ctx.arc(t.x, t.y, t.size * 2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 0.95
  ctx.fillStyle = t.color
  ctx.beginPath()
  ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.beginPath()
  ctx.arc(t.x - t.size * 0.3, t.y - t.size * 0.3, t.size * 0.35, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = selected ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 2
  if (selected) ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.arc(t.x, t.y, t.size + (selected ? 4 : 0), 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.font = FONT
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
  ctx.shadowBlur = 4
  ctx.fillText(labelFor(t), t.x, t.y)
  ctx.shadowBlur = 0
}

function drawTooltip(ctx, t) {
  ctx.font = FONT
  const w = ctx.measureText(t.text).width + 16
  const y = t.y - t.size - 20
  ctx.fillStyle = 'rgba(15, 23, 41, 0.92)'
  ctx.strokeStyle = t.color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(t.x - w / 2, y - 13, w, 26, 6)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.fillText(t.text, t.x, y)
}

export function render(ctx, state, now = performance.now()) {
  const { view, camera } = state
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0)
  drawBackground(ctx, view, now)

  ctx.save()
  ctx.translate(view.width / 2, view.height / 2)
  ctx.scale(camera.zoom, camera.zoom)
  ctx.translate(-view.width / 2 + camera.x, -view.height / 2 + camera.y)

  renderWaves(ctx, state.waves)
  for (const z of state.zones) drawZone(ctx, z, now)
  if (state.showLinks) drawLinks(ctx, state)
  renderParticles(ctx, state.particles)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const t of state.thoughts) drawThought(ctx, t, t === state.selected)
  const focus = state.hovered || state.dragged
  if (focus && labelFor(focus) !== focus.text) drawTooltip(ctx, focus)

  ctx.restore()
}
