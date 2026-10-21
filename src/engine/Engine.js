import { updatePhysics } from './Physics'
import { render } from './Renderer'
import { createAmbientParticle, createWave, updateParticles, updateWaves } from '../models/Particle'

// Runs physics + rendering on one requestAnimationFrame loop.
// Returns a stop function so React effects can clean up.
export function startEngine(canvas, state, params, onTick) {
  const ctx = canvas.getContext('2d')
  let last = performance.now()
  let lastTick = 0
  let frame

  const loop = (now) => {
    const f = Math.min((now - last) / (1000 / 60), 3) // frames elapsed, capped after tab switches
    last = now

    if (params.running) {
      updatePhysics(state, params, f, now)
      state.particles = updateParticles(state.particles, f)
      state.waves = updateWaves(state.waves, f)
      if (!state.reduceMotion) {
        if (Math.random() < 0.3 * f) state.particles.push(createAmbientParticle(state.view))
        if (Math.random() < 0.01 * f) {
          const { width, height } = state.view
          state.waves.push(createWave(Math.random() * width, Math.random() * height, `hsl(${Math.random() * 360},70%,60%)`))
        }
      }
    }
    if (ctx) render(ctx, state, now)

    if (now - lastTick > 250) {
      lastTick = now
      onTick()
    }
    frame = requestAnimationFrame(loop)
  }

  frame = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(frame)
}
