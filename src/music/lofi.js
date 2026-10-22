/*
  A lo-fi loop played live with Web Audio, so there's no audio file to download:
  four soft seventh chords, a round bass, a gentle kick and swung hats, a sparse melody,
  and vinyl crackle, all through a warm low-pass filter.

  Browsers only allow sound after a click, so nothing here runs until start() is called
  from one. Notes are scheduled a little ahead of time on the audio clock, which keeps
  the beat steady even when the page is busy.
*/
const BPM = 72
const EIGHTH = 60 / BPM / 2
const LOOKAHEAD = 0.12
const VOLUME = 0.2

// Fmaj7 – Em7 – Dm7 – Cmaj7, one bar each (MIDI note numbers).
const CHORDS = [
  [53, 57, 60, 64],
  [52, 55, 59, 62],
  [50, 53, 57, 60],
  [48, 52, 55, 59],
]
// C major pentatonic, an octave up, for the melody.
const SCALE = [72, 74, 76, 79, 81]

const freq = (midi) => 440 * 2 ** ((midi - 69) / 12)

export function createLofi() {
  let ctx = null
  let master = null
  let noise = null
  let crackle = null
  let timer = 0
  let step = 0
  let nextTime = 0

  function setup() {
    ctx = new AudioContext()
    const warmth = ctx.createBiquadFilter()
    warmth.type = 'lowpass'
    warmth.frequency.value = 2200
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(warmth).connect(ctx.destination)

    // One second of white noise, reused for hats and crackle.
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }

  function voice(type, f, time, length, level, attack = 0.02) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = f
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(level, time + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + length)
    osc.connect(gain).connect(master)
    osc.start(time)
    osc.stop(time + length + 0.05)
  }

  function kick(time) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.setValueAtTime(110, time)
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.18)
    gain.gain.setValueAtTime(0.55, time)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3)
    osc.connect(gain).connect(master)
    osc.start(time)
    osc.stop(time + 0.35)
  }

  function hat(time, level) {
    const src = ctx.createBufferSource()
    src.buffer = noise
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 7000
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(level, time)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05)
    src.connect(hp).connect(gain).connect(master)
    src.start(time, Math.random() * 0.5, 0.06)
  }

  // Quiet, endless, filtered noise: the record's surface.
  function startCrackle() {
    crackle = ctx.createBufferSource()
    crackle.buffer = noise
    crackle.loop = true
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 3000
    band.Q.value = 0.7
    const gain = ctx.createGain()
    gain.gain.value = 0.035
    crackle.connect(band).connect(gain).connect(master)
    crackle.start()
  }

  // One eighth note's worth of music at `time`.
  function playStep(time) {
    const beatInBar = step % 8
    const chord = CHORDS[Math.floor(step / 8) % CHORDS.length]
    // Swing: every other eighth comes a little late.
    const swung = time + (step % 2 ? EIGHTH * 0.18 : 0)

    if (beatInBar === 0) for (const note of chord) voice('triangle', freq(note), time, EIGHTH * 8, 0.06, 0.4)
    if (beatInBar === 0 || beatInBar === 5) voice('sine', freq(chord[0] - 12), time, EIGHTH * 3, 0.32)
    if (beatInBar === 0 || beatInBar === 5) kick(time)
    if (beatInBar === 4) hat(swung, 0.14)
    hat(swung, beatInBar % 2 ? 0.05 : 0.08)
    // Electric-piano stabs on the off-beats, and now and then a melody note.
    if (beatInBar === 3 || beatInBar === 6) for (const note of chord.slice(1)) voice('sine', freq(note + 12), swung, EIGHTH * 1.5, 0.035)
    if (Math.random() < 0.22 && beatInBar !== 0) voice('sine', freq(SCALE[Math.floor(Math.random() * SCALE.length)]), swung, EIGHTH * 2.5, 0.06)

    step++
  }

  function schedule() {
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      playStep(nextTime)
      nextTime += EIGHTH
    }
  }

  return {
    async start() {
      if (!ctx) setup()
      await ctx.resume()
      startCrackle()
      step = 0
      nextTime = ctx.currentTime + 0.08
      schedule()
      timer = setInterval(schedule, 25)
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.6)
    },

    // Fades out, then stops scheduling and lets the audio clock rest.
    stop() {
      if (!ctx) return
      clearInterval(timer)
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.25)
      const record = crackle
      setTimeout(() => {
        record?.stop()
        if (ctx.state === 'running' && master.gain.value < 0.01) ctx.suspend()
      }, 1200)
    },
  }
}
