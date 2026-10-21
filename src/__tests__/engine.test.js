import { describe, expect, it } from 'vitest'
import { areAntonyms, updatePhysics } from '../engine/Physics'
import { screenToWorld, worldToScreen } from '../engine/camera'
import { layoutZones } from '../config/zones'
import { createThought } from '../models/Thought'
import { decodeShare, encodeShare, hydrate } from '../storage'

const world = (thoughts) => ({
  thoughts,
  particles: [],
  zones: [],
  home: null,
  view: { width: 2000, height: 2000 },
})
const params = { gravity: 0, chaos: 0, friction: 1 }

describe('antonyms', () => {
  it('matches whole words in either order', () => {
    expect(areAntonyms('so happy today', 'sad')).toBe(true)
    expect(areAntonyms('calm', 'pure chaos')).toBe(true)
    expect(areAntonyms('दुख', 'सुख')).toBe(true)
  })
  it('ignores words that merely contain a keyword', () => {
    expect(areAntonyms('delight', 'dark')).toBe(false)
    expect(areAntonyms('sadness', 'happy')).toBe(false)
  })
})

describe('physics', () => {
  it('pulls opposite thoughts together', () => {
    const a = { ...createThought({ x: 900, y: 1000, text: 'happy' }), vx: 0, vy: 0 }
    const b = { ...createThought({ x: 1100, y: 1000, text: 'sad' }), vx: 0, vy: 0 }
    const before = b.x - a.x
    for (let i = 0; i < 10; i++) updatePhysics(world([a, b]), params, 1, 0)
    expect(b.x - a.x).toBeLessThan(before)
  })
  it('separates overlapping thoughts', () => {
    const a = { ...createThought({ x: 1000, y: 1000, text: 'one' }), vx: 0, vy: 0 }
    const b = { ...createThought({ x: 1005, y: 1000, text: 'two' }), vx: 0, vy: 0 }
    updatePhysics(world([a, b]), params, 1, 0)
    expect(b.x - a.x).toBeGreaterThanOrEqual(a.size + b.size - 0.001)
  })
})

describe('camera', () => {
  it('round-trips screen and world coordinates', () => {
    const state = { camera: { x: 40, y: -25, zoom: 1.4 }, view: { width: 800, height: 600 } }
    const p = { x: 123, y: 456 }
    const back = screenToWorld(worldToScreen(p, state), state)
    expect(back.x).toBeCloseTo(p.x)
    expect(back.y).toBeCloseTo(p.y)
  })
})

describe('zones layout', () => {
  it.each([
    [1440, 900],
    [390, 844],
  ])('keeps zones on screen at %ix%i', (w, h) => {
    const { zones } = layoutZones(w, h)
    for (const z of zones) {
      expect(z.x - z.radius).toBeGreaterThanOrEqual(0)
      expect(z.x + z.radius).toBeLessThanOrEqual(w)
      expect(z.y + z.radius + 30).toBeLessThanOrEqual(h)
    }
  })
})

describe('share links', () => {
  it('round-trips unicode thoughts', () => {
    const thoughts = [createThought({ x: 100, y: 200, text: 'सुख ✨', zone: 'focus' })]
    const code = encodeShare(thoughts, { width: 1000, height: 1000 })
    const restored = hydrate(decodeShare(code), { width: 500, height: 400 }, () => ({ x: 0, y: 0 }))
    expect(restored[0]).toMatchObject({ text: 'सुख ✨', zone: 'focus', x: 50, y: 80 })
  })
  it('rejects garbage', () => {
    expect(decodeShare('%%%')).toBeNull()
    expect(hydrate({ nope: 1 }, { width: 1, height: 1 })).toEqual([])
  })
})
