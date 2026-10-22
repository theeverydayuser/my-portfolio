import { useEffect, useRef, useState } from 'react'
import { APPEARANCES } from '../appearance.js'
import styles from './MenuBar.module.css'

const LINKEDIN = 'https://www.linkedin.com/in/ademidesamuel/'
const APPEARANCE_LABELS = { light: 'Light', dark: 'Dark', auto: 'Auto' }

/*
  macOS menu bar: logo menu, the front app's name in bold, a couple of real menus,
  and status items with a live clock on the right. Hidden on phones (see global.css --menubar-h).
*/
export default function MenuBar({ appName, openWindows, frontId, appearance, onOpen, onClose, onMinimize, onTidy }) {
  const [openMenu, setOpenMenu] = useState(null)
  const barRef = useRef(null)
  const hasFront = Boolean(frontId)

  const menus = [
    {
      id: 'logo',
      label: <LogoMark />,
      ariaLabel: 'Main menu',
      items: [
        { label: 'About This Portfolio', action: () => onOpen('about-me') },
        { separator: true },
        { heading: 'Appearance' },
        ...APPEARANCES.map((value) => ({
          label: APPEARANCE_LABELS[value],
          checked: appearance.value === value,
          action: () => appearance.set(value),
        })),
        // Owner-only once the room is online; for now it's offered while developing.
        ...(import.meta.env.DEV ? [{ separator: true }, { label: 'Tidy Up the Room', action: onTidy }] : []),
      ],
    },
    {
      id: 'app',
      label: appName,
      bold: true,
      items: [
        { label: 'About Mide', action: () => onOpen('about-me') },
        { label: 'Notes', action: () => onOpen('notes') },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { label: 'Minimize', disabled: !hasFront, action: onMinimize },
        { label: 'Close Window', disabled: !hasFront, action: onClose },
        ...(openWindows.length ? [{ separator: true }] : []),
        ...openWindows.map((w) => ({
          label: w.title,
          checked: w.id === frontId,
          minimized: w.minimized,
          action: () => onOpen(w.id),
        })),
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        // The room's Tour listens for this and starts again from the first step.
        { label: 'Show Me Around', action: () => window.dispatchEvent(new Event('room:tour')) },
        { label: 'Contact Mide on LinkedIn', href: LINKEDIN },
        { separator: true },
        { label: 'Esc closes the front window', disabled: true },
      ],
    },
  ]

  // Clicking anywhere else, or pressing Escape, closes the open menu.
  useEffect(() => {
    if (!openMenu) return
    const onPointerDown = (event) => {
      if (!barRef.current?.contains(event.target)) setOpenMenu(null)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openMenu])

  return (
    <header ref={barRef} className={styles.bar} data-menubar>
      <nav className={styles.menus} aria-label="Menu bar">
        {menus.map((menu) => (
          <div key={menu.id} className={styles.menuSlot}>
            <button
              type="button"
              className={`${styles.title} ${menu.bold ? styles.bold : ''} ${openMenu === menu.id ? styles.titleOpen : ''}`}
              aria-haspopup="menu"
              aria-expanded={openMenu === menu.id}
              aria-label={menu.ariaLabel}
              onClick={() => setOpenMenu((current) => (current === menu.id ? null : menu.id))}
              // As on macOS, once one menu is open, moving across the bar opens the others.
              onPointerEnter={() => openMenu && setOpenMenu(menu.id)}
            >
              {menu.label}
            </button>
            {openMenu === menu.id && <Menu items={menu.items} onDone={() => setOpenMenu(null)} />}
          </div>
        ))}
      </nav>

      <div className={styles.status}>
        <WifiIcon />
        <BatteryIcon />
        <Clock />
      </div>
    </header>
  )
}

function Menu({ items, onDone }) {
  const ref = useRef(null)

  useEffect(() => {
    ref.current?.querySelector('[role="menuitem"]:not([aria-disabled="true"]), [role="menuitemradio"]')?.focus()
  }, [])

  // Arrow keys move between items, like a native menu.
  const onKeyDown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const enabled = [...ref.current.querySelectorAll('[role^="menuitem"]:not([aria-disabled="true"])')]
    const index = enabled.indexOf(document.activeElement)
    const next = event.key === 'ArrowDown' ? index + 1 : index - 1
    enabled[(next + enabled.length) % enabled.length]?.focus()
  }

  return (
    <div ref={ref} className={styles.menu} role="menu" onKeyDown={onKeyDown}>
      {items.map((item, i) => {
        if (item.separator) return <div key={i} className={styles.separator} role="separator" />
        if (item.heading) return <div key={i} className={styles.heading}>{item.heading}</div>
        const mark = <span className={styles.check} aria-hidden="true">{item.checked ? '✓' : item.minimized ? '◆' : ''}</span>
        if (item.href) {
          return (
            <a key={i} className={styles.item} role="menuitem" href={item.href} target="_blank" rel="noopener noreferrer" onClick={onDone}>
              {mark}
              {item.label}
            </a>
          )
        }
        return (
          <button
            key={i}
            type="button"
            className={styles.item}
            role={item.checked !== undefined ? 'menuitemradio' : 'menuitem'}
            aria-checked={item.checked !== undefined ? item.checked : undefined}
            aria-disabled={item.disabled || undefined}
            onClick={() => {
              if (item.disabled) return
              item.action()
              onDone()
            }}
          >
            {mark}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

// Ticks on the minute, like the real menu-bar clock.
function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let interval = 0
    const timeout = setTimeout(() => {
      setNow(new Date())
      interval = setInterval(() => setNow(new Date()), 60_000)
    }, 60_000 - (Date.now() % 60_000))
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <time className={styles.clock} dateTime={now.toISOString()}>
      <span>{dateFormat.format(now)}</span>
      <span>{timeFormat.format(now)}</span>
    </time>
  )
}

// "M" monogram in place of the Apple logo.
function LogoMark() {
  return (
    <svg viewBox="0 0 16 16" className={styles.logo} aria-hidden="true">
      <path d="M2.5 13V3.2L8 9.4l5.5-6.2V13" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 18 14" className={styles.statusIcon} aria-hidden="true">
      <path d="M9 12.6l2.2-2.6a3.4 3.4 0 0 0-4.4 0z" fill="currentColor" />
      <path d="M4.6 7.4a6.7 6.7 0 0 1 8.8 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M2 4.4a10.6 10.6 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg viewBox="0 0 26 12" className={styles.battery} aria-hidden="true">
      <rect x="0.75" y="0.75" width="21.5" height="10.5" rx="3" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.5" />
      <rect x="2.4" y="2.4" width="18.2" height="7.2" rx="1.7" fill="currentColor" />
      <path d="M23.8 4.2v3.6a1.9 1.9 0 0 0 0-3.6z" fill="currentColor" opacity="0.5" />
    </svg>
  )
}
