import { useEffect, useState } from 'react'

/*
  Light / Dark / Auto, like System Settings › Appearance.
  "auto" follows the system; the other two set [data-theme] on <html>, which the colour
  tokens in global.css read. The choice is a per-visitor convenience, so storage may fail quietly.
*/
const KEY = 'appearance'
export const APPEARANCES = ['light', 'dark', 'auto']

function stored() {
  try {
    const value = localStorage.getItem(KEY)
    return APPEARANCES.includes(value) ? value : 'auto'
  } catch {
    return 'auto'
  }
}

export function useAppearance() {
  const [value, setValue] = useState(stored)

  useEffect(() => {
    const root = document.documentElement
    if (value === 'auto') delete root.dataset.theme
    else root.dataset.theme = value
    try {
      localStorage.setItem(KEY, value)
    } catch {
      // Private windows can block storage; the choice still applies for this visit.
    }
  }, [value])

  return { value, set: setValue }
}
