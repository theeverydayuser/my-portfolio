/*
  How a testimonial note looks, shared by the board on the wall (larger screens) and the
  pull-down board (phones): its paper colour, its tilt and its own handwriting.
*/
const NOTE_COLOURS = ['#fff3b0', '#ffd6e0', '#cfe9ff', '#d8f5c8', '#ffe2c2', '#e6dcff']

// A different hand on every note. `scale` evens out how big each font writes; fonts with only
// one weight get a thin stroke (`ink`) to look as bold as the rest.
const HANDS = [
  { font: "'Caveat', cursive", scale: 1.18, weight: 700, ink: 0 },
  { font: "'Kalam', cursive", scale: 0.9, weight: 700, ink: 0 },
  { font: "'Patrick Hand', cursive", scale: 1, weight: 400, ink: 0.35 },
  { font: "'Gochi Hand', cursive", scale: 1, weight: 400, ink: 0.3 },
  { font: "'Architects Daughter', cursive", scale: 0.84, weight: 400, ink: 0.45 },
  { font: "'Indie Flower', cursive", scale: 0.92, weight: 400, ink: 0.45 },
]

// CSS variables for the note at `index`: --paper, --tilt and the --hand-* set.
export function noteStyle(index) {
  const hand = HANDS[index % HANDS.length]
  return {
    '--paper': NOTE_COLOURS[index % NOTE_COLOURS.length],
    '--tilt': `${index % 2 ? 1.2 : -1.2}deg`,
    '--hand': hand.font,
    '--hand-scale': hand.scale,
    '--hand-weight': hand.weight,
    '--hand-ink': `${hand.ink}px`,
  }
}
