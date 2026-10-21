// The renderer scales the world around the screen centre and offsets it by camera.x/y.
export const clampZoom = (z) => Math.min(2, Math.max(0.5, z))

export function screenToWorld(p, { camera: c, view: v }) {
  return {
    x: (p.x - v.width / 2) / c.zoom + v.width / 2 - c.x,
    y: (p.y - v.height / 2) / c.zoom + v.height / 2 - c.y,
  }
}

export function worldToScreen(p, { camera: c, view: v }) {
  return {
    x: (p.x + c.x - v.width / 2) * c.zoom + v.width / 2,
    y: (p.y + c.y - v.height / 2) * c.zoom + v.height / 2,
  }
}
