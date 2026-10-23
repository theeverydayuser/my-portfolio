/*
  The AiBlob face vector, one row per mood: copied from the VO codebase
  (laravel12_vo resources/js/components/ai-blob-moods.js), where the mascot lives.
  Units: eyeOpen/eyeSize are scale factors, browY/browAsym/mouthW/mouthX are viewBox px,
  browA/tilt/armL/armR degrees, mouthC is -1 (frown) … 1 (grin), mouthO 0 (shut) …
  1 (gaping), mouthTilt is how far the right corner rides above the left (the smirk), the
  rest 0…1. `look` is how much of the pointer the mood is willing to follow.
*/
export const MOODS = {
  neutral: { eyeOpen: 1, eyeSize: 1, browY: 0, browA: 0, browO: 0, browAsym: 0, mouthW: 16, mouthC: 0.25, mouthO: 0, mouthX: 0, mouthTilt: 1.4, cheek: 0.35, tilt: 0, sx: 1, sy: 1, heat: 0, armL: 6, armR: 6, look: 1 },
  curious: { eyeOpen: 1.05, eyeSize: 1.1, browY: -4, browA: 0, browO: 1, browAsym: 5, mouthW: 12, mouthC: 0.2, mouthO: 0.15, mouthX: 5, mouthTilt: 1.8, cheek: 0.4, tilt: -9, sx: 0.99, sy: 1.02, heat: 0, armL: 24, armR: 4, look: 1 },
  happy: { eyeOpen: 0.7, eyeSize: 1, browY: -2, browA: 0, browO: 0, browAsym: 0, mouthW: 34, mouthC: 1, mouthO: 0.5, mouthX: 0, mouthTilt: 0.4, cheek: 0.9, tilt: 0, sx: 0.98, sy: 1.05, heat: 0, armL: 36, armR: 36, look: 1 },
  surprised: { eyeOpen: 1.3, eyeSize: 1.3, browY: -7, browA: 0, browO: 1, browAsym: 0, mouthW: 14, mouthC: 0, mouthO: 1, mouthX: 0, mouthTilt: 0, cheek: 0.5, tilt: 0, sx: 0.97, sy: 1.06, heat: 0, armL: 26, armR: 26, look: 1 },
  hmm: { eyeOpen: 0.8, eyeSize: 1, browY: -1, browA: 8, browO: 1, browAsym: 4, mouthW: 12, mouthC: -0.15, mouthO: 0, mouthX: 7, mouthTilt: 2.6, cheek: 0.3, tilt: 5, sx: 1, sy: 1, heat: 0, armL: 6, armR: 16, look: 0.25 },
  sleepy: { eyeOpen: 0.16, eyeSize: 1, browY: 3, browA: 0, browO: 0, browAsym: 0, mouthW: 10, mouthC: 0.1, mouthO: 0.12, mouthX: 0, mouthTilt: 0.9, cheek: 0.25, tilt: 7, sx: 1.03, sy: 0.96, heat: 0, armL: 0, armR: 0, look: 0 },
  sad: { eyeOpen: 0.85, eyeSize: 1, browY: 1, browA: -12, browO: 1, browAsym: 0, mouthW: 20, mouthC: -0.8, mouthO: 0, mouthX: 0, mouthTilt: 0, cheek: 0.2, tilt: 0, sx: 1.05, sy: 0.94, heat: 0, armL: -10, armR: -10, look: 0.6 },
  angry: { eyeOpen: 0.65, eyeSize: 0.95, browY: 3, browA: 18, browO: 1, browAsym: 0, mouthW: 22, mouthC: -0.6, mouthO: 0.18, mouthX: 0, mouthTilt: 0, cheek: 0.1, tilt: 0, sx: 1.03, sy: 0.97, heat: 1, armL: 16, armR: 16, look: 0.25 },
}

/*
  Skins. blue, coral, sage and ink are the motion films' own (naxum-motion reel/blob.js);
  blue300, blue800 and paper are made the same way from the NaXum blue ramp.
*/
export const SKINS = {
  blue: { top: '#e6f1fa', hi: '#8dc1e6', base: '#4fa0d5', deep: '#2b6a96', rimHi: '#f2f8fd', rim: '#6bafdd', rimDeep: '#245577', bounce: '#d4e7f5', shade: '#0f2a3d', ink: '#0d1f2c' },
  blue300: { top: '#f3f9fd', hi: '#b7d8f0', base: '#8dc1e6', deep: '#4fa0d5', rimHi: '#ffffff', rim: '#a6cfec', rimDeep: '#3685bb', bounce: '#e6f1fa', shade: '#1d4460', ink: '#0d1f2c' },
  blue800: { top: '#b7d8f0', hi: '#3685bb', base: '#245577', deep: '#1d4460', rimHi: '#daebf7', rim: '#2b6a96', rimDeep: '#0f2a3d', bounce: '#6bafdd', shade: '#06131d', ink: '#06131d' },
  ink: { top: '#8a8c8b', hi: '#565857', base: '#1e201f', deep: '#000100', rimHi: '#a2a4a3', rim: '#363837', rimDeep: '#000100', bounce: '#565857', shade: '#000000', ink: '#000100' },
  coral: { top: '#fff0eb', hi: '#f9a48f', base: '#f55d3e', deep: '#c2421f', rimHi: '#fff4f0', rim: '#f77c61', rimDeep: '#8f2f15', bounce: '#fdd2c6', shade: '#3d1205', ink: '#2a0d05' },
  sage: { top: '#eef3ef', hi: '#a9c1b3', base: '#4e6e5d', deep: '#3a5446', rimHi: '#f3f7f4', rim: '#6f8f7e', rimDeep: '#263a2f', bounce: '#cfdcd4', shade: '#101c15', ink: '#0e1712' },
  paper: { top: '#ffffff', hi: '#ffffff', base: '#eef0f2', deep: '#c4c9ce', rimHi: '#ffffff', rim: '#dde1e5', rimDeep: '#a3a9b0', bounce: '#ffffff', shade: '#2a3038', ink: '#0d1f2c' },
}
