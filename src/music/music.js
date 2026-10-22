import { useSyncExternalStore } from 'react'
import { createLofi } from './lofi.js'

/*
  The room's background music, shared by the record player and the autoplay.

  Browsers don't let a page start sound on its own, so "autoplay" here means: the music
  starts with the visitor's first click or key press anywhere in the room. Anyone who stops
  it has that remembered (in this browser), and it stays off on their next visit.
*/
const PREF_KEY = 'room:music'

let engine = null
let playing = false
const listeners = new Set()

const notify = () => listeners.forEach((listener) => listener())

function remember(value) {
  try {
    localStorage.setItem(PREF_KEY, value)
  } catch {
    // Storage blocked: the choice still holds for this visit.
  }
}

function wantsMusic() {
  try {
    return localStorage.getItem(PREF_KEY) !== 'off'
  } catch {
    return true
  }
}

export async function play() {
  if (playing) return
  engine ??= createLofi()
  playing = true
  notify()
  await engine.start()
}

export function stop() {
  if (!playing) return
  engine.stop()
  playing = false
  notify()
}

// The record player's click: an explicit choice, so it's remembered.
export function toggleMusic() {
  if (playing) {
    stop()
    remember('off')
  } else {
    remember('on')
    // intentional fire-and-forget: start() only waits for the audio clock to resume
    play()
  }
}

export function useMusicPlaying() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => playing,
  )
}

/*
  Starts the music on the first click or key press, unless the visitor turned it off before,
  or that first click is on the record player itself (which then decides on its own).
  Returns a function that removes the listeners.
*/
export function armAutoplay() {
  if (!wantsMusic()) return () => {}
  const onFirst = (event) => {
    disarm()
    if (event.target instanceof Element && event.target.closest('[data-music-toggle]')) return
    // intentional fire-and-forget: the click it rides on doesn't wait for the music
    play()
  }
  const disarm = () => {
    window.removeEventListener('pointerdown', onFirst, true)
    window.removeEventListener('keydown', onFirst, true)
  }
  window.addEventListener('pointerdown', onFirst, true)
  window.addEventListener('keydown', onFirst, true)
  return disarm
}
