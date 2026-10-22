// Room pixels → a percentage of the room, so overlays line up with the canvas at any scale.
export const pctX = (x, L) => `${(x / L.W) * 100}%`
export const pctY = (y, L) => `${(y / L.H) * 100}%`

// Absolute position and size for a { left, top, width, height } rectangle in room pixels.
export const place = (rect, L) => ({
  left: pctX(rect.left, L),
  top: pctY(rect.top, L),
  width: pctX(rect.width, L),
  height: pctY(rect.height, L),
})
