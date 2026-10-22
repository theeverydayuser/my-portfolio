import { useEffect, useState } from 'react'

/*
  Light / Dark / Auto, like System Settings › Appearance.
  "auto" follows the system; the other two set [data-theme] on <html>, which the colour
  tokens in global.css read. The choice is a per-visitor convenience, so storage may fail quietly.
  The room follows it too: daytime in Light, night in Dark (`day` is the look in effect, so
  "auto" resolves to the system's), and `toggle` flips between the two (the room's light switch).
*/
const DARK_QUERY = '(prefers-color-scheme: dark)'
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

function useSystemDark() {
  const [dark, setDark] = useState(() => window.matchMedia(DARK_QUERY).matches)
  useEffect(() => {
    const list = window.matchMedia(DARK_QUERY)
    const onChange = () => setDark(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [])
  return dark
}

export function useAppearance() {
  const [value, setValue] = useState(stored)
  const systemDark = useSystemDark()
  const day = value === 'light' || (value === 'auto' && !systemDark)

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

  return { value, set: setValue, day, toggle: () => setValue(day ? 'dark' : 'light') }
}
