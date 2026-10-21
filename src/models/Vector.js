export const Vector = {
  sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
  mag: (v) => Math.hypot(v.x, v.y),
  dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
}
