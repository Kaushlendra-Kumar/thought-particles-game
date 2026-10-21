export const MAX_PARTICLES = 300

const rand = (min, max) => min + Math.random() * (max - min)

export function createParticle(x, y, color, speed = 2) {
  return {
    x,
    y,
    vx: rand(-speed, speed),
    vy: rand(-speed, speed),
    life: 1,
    size: rand(2, 6),
    color: color || `hsl(${rand(200, 260)}, 80%, 65%)`,
  }
}

export function burst(state, x, y, color, count, speed) {
  for (let i = 0; i < count; i++) state.particles.push(createParticle(x, y, color, speed))
}

export function createAmbientParticle({ width, height }) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: rand(-0.25, 0.25),
    vy: rand(-0.25, 0.25),
    life: rand(0.4, 1.2),
    size: rand(1, 3),
    color: '#ffffff',
    ambient: true,
  }
}

export function createWave(x, y, color, maxRadius = rand(150, 350)) {
  return { x, y, radius: 10, maxRadius, speed: rand(1, 3), alpha: 1, color }
}

// `f` is elapsed time in 60fps frames, so motion is frame-rate independent.
export function updateParticles(particles, f) {
  const drag = Math.pow(0.99, f)
  const alive = particles.filter((p) => {
    p.x += p.vx * f
    p.y += p.vy * f
    if (!p.ambient) p.vy += 0.03 * f
    p.vx *= drag
    p.vy *= drag
    p.life -= (p.ambient ? 0.006 : 0.02) * f
    return p.life > 0
  })
  return alive.length > MAX_PARTICLES ? alive.slice(-MAX_PARTICLES) : alive
}

export function updateWaves(waves, f) {
  return waves.filter((w) => {
    w.radius += w.speed * f
    w.alpha = 1 - w.radius / w.maxRadius
    return w.radius < w.maxRadius
  })
}

// Additive blending gives the glow look without the cost of shadowBlur per particle.
export function renderParticles(ctx, particles) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (const p of particles) {
    ctx.globalAlpha = Math.min(1, p.life) * 0.8
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

export function renderWaves(ctx, waves) {
  ctx.save()
  ctx.lineWidth = 3
  for (const w of waves) {
    ctx.strokeStyle = w.color
    ctx.globalAlpha = w.alpha * 0.5
    ctx.beginPath()
    ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}
