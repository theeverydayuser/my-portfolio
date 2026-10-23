import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { isPlaying, play as playMusic, stop as stopMusic } from '../../music/music.js'
import AiBlob from './AiBlob.jsx'
import { makeDeck } from './deck.jsx'
import styles from './deck.module.css'

/*
  "How I used Claude to create a motion design system for marketing": the NaXum motion
  design system case study, built from Mide's Figma deck (NaXum — Motion Design System
  (Case Study), 15 slides). Words are the deck's, word for word; the headlines are the deck's
  own outlined Helvena artwork. The films loop a short preview and play in full in a popup.
  Sizes follow the 1920-wide slides through --u (one design pixel), with floors for phones.
*/
const A = '/assets/naxum-motion/'
const { Slide, Headline, Img, Eyebrow, Header } = makeDeck({ base: A, line: 'NAXUM · MOTION DESIGN SYSTEM', total: 15 })

// Each film, and a 4-second silent clip of it that loops on its card.
const film = (file, title) => ({ src: `${A}${file}.mp4`, preview: `${A}${file}-preview.mp4`, title })
const films = {
  maya: film('Naxum-Meet-Maya-V6', 'Meet Maya'),
  newLook: film('Naxum-New-Look-Showreel-V2', 'The new naxum.com'),
  mascots: film('Naxum-Meet-The-Assistant-Mascots-V2', 'Meet the assistant'),
  ai: film('Naxum-Vo-Ai-Launch-V2', 'AI in the Virtual Office'),
  money: film('Naxum-Money-Flow-V6', 'Money flow'),
}

export default function MotionCaseStudy() {
  return (
    <div className={styles.deck}>
      <FilmGrid />
      <Cover />
      <Challenge />
      <Idea />
      <System />
      <RealUi />
      <Brand />
      <Mascot />
      <People />
      <MotionLanguage part={1} />
      <MotionLanguage part={2} />
      <Sound />
      <Rules />
      <Qa />
      <Shipped />
      <Close />
    </div>
  )
}

/* ── Building blocks ─────────────────────────────────── */

/*
  A film card: a short silent preview loops in it (only while it's on screen, so off-screen
  cards cost nothing), with a play button. A click opens the whole film, with sound, in a
  popup over everything.
*/
function Film({ film, poster, w, h, className = '' }) {
  const [open, setOpen] = useState(false)
  const preview = useRef(null)

  useEffect(() => {
    const el = preview.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(([entry]) => {
      // A browser may refuse to autoplay (data saver); the still stays up, which is fine.
      if (entry.isIntersecting) el.play().catch(() => {})
      else el.pause()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <button type="button" className={`${styles.filmStill} ${className}`} onClick={() => setOpen(true)} aria-label={`Play the film: ${film.title}`}>
        <video ref={preview} className={styles.img} src={film.preview} poster={`${A}${poster}.webp`} width={w} height={h} muted loop playsInline preload="none" aria-hidden="true" />
        <span className={styles.play} aria-hidden="true" />
      </button>
      {open && <FilmPopup film={film} onClose={() => setOpen(false)} />}
    </>
  )
}

/*
  The whole film, with sound and controls, in a popup over the page. Escape, the close
  button or a click outside the film closes it. The room's music steps aside while it plays.
*/
function FilmPopup({ film, onClose }) {
  const close = useRef(null)

  useEffect(() => {
    const musicWasOn = isPlaying()
    stopMusic()
    close.current?.focus()
    return () => {
      // intentional fire-and-forget: play() only waits for the audio clock to resume
      if (musicWasOn) playMusic()
    }
  }, [])

  // Escape closes the film only: React passes key presses on up to the showcase (the popup is
  // rendered from inside it), which would otherwise close too.
  const onKeyDown = (event) => {
    if (event.key !== 'Escape') return
    event.stopPropagation()
    onClose()
  }

  return createPortal(
    <div className={styles.popup} role="dialog" aria-modal="true" aria-label={film.title} onKeyDown={onKeyDown} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={styles.popupFrame}>
        <video className={styles.popupVideo} src={film.src} controls autoPlay playsInline />
        <p className={styles.popupTitle}>{film.title}</p>
      </div>
      <button ref={close} type="button" className={styles.popupClose} onClick={onClose} aria-label="Close the film">
        ✕
      </button>
    </div>,
    document.body,
  )
}

/* ── The films, first: every film in a grid, ready to play ── */

const GRID = [
  ['maya', 'cover_globe', 'Meet Maya'],
  ['newLook', 'ship_newlook', 'The new naxum.com'],
  ['mascots', 'ship_mascots', 'Meet the assistant'],
  ['ai', 'ship_ai', 'AI in the Virtual Office'],
  ['money', 'ship_money', 'Money flow'],
]

function FilmGrid() {
  return (
    <section className={`${styles.slide} ${styles.dark}`} aria-label="The films">
      <Eyebrow>THE FILMS</Eyebrow>
      <ul className={styles.filmGrid}>
        {GRID.map(([film, poster, title], i) => (
          <li key={film} className={i === 0 ? styles.filmGridMain : ''}>
            <Film film={films[film]} poster={poster} w={880} h={495} className={styles.glow} />
            <p className={styles.shippedTitle}>{title}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ── The slides ──────────────────────────────────────── */

function Cover() {
  return (
    <Slide page="01" className={styles.cover}>
      <div className={styles.coverText}>
        <Eyebrow>CASE STUDY · NAXUM DESIGN</Eyebrow>
        <Headline n={1} w={703} h={325}>
          Motion, by design.
        </Headline>
        <p className={styles.bodyL}>How we built a design system for making product films: real UI instead of recordings, a mascot that carries the story, sound you can see, and rules earned frame by frame.</p>
        <p className={`${styles.mono} ${styles.blue200}`}>4 FILMS · 1 SYSTEM · 0 SCREEN RECORDINGS</p>
      </div>
      <div className={styles.pair}>
        <Film film={films.maya} poster="cover_globe" w={880} h={495} className={styles.pairBig} />
        <Img name="m_count" w={620} h={349} className={styles.pairSmall} />
      </div>
    </Slide>
  )
}

const CHALLENGES = [
  ['Blurry the moment you zoom', 'Pixels can’t be zoomed. Every close-up went soft.'],
  ['Slow to change', 'One copy fix meant re-recording the whole take.'],
  ['Off-brand', 'White-label screens showed a client’s colours, not ours.'],
  ['Built once, thrown away', 'Nothing carried over from one film to the next.'],
]

function Challenge() {
  return (
    <Slide page="02" light>
      <Eyebrow>01 — THE CHALLENGE</Eyebrow>
      <Headline n={2} w={1043} h={200}>
        Our product videos were screen recordings.
      </Headline>
      <div className={styles.split}>
        <ol className={styles.numbered}>
          {CHALLENGES.map(([title, body], i) => (
            <li key={title}>
              <span className={`${styles.mono} ${styles.coral}`}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className={styles.titleCard}>{title}</p>
                <p className={styles.bodyS}>{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <figure className={styles.figure}>
          <blockquote className={`${styles.titleCard} ${styles.blue600}`}>“Whenever you use VO screens they are always blurry.”</blockquote>
          <p className={`${styles.mono} ${styles.muted}`}>— MIDE, VP OF FRONT-END DESIGN</p>
          <Img name="zoom_raster" w={720} h={405} className={styles.lightShadow} />
          <figcaption className={`${styles.mono} ${styles.muted}`}>A SCREEN RECORDING AT 3× ZOOM</figcaption>
        </figure>
      </div>
    </Slide>
  )
}

const STEPS = [
  ['t = 19.70 s', 'One number: the moment in the film.'],
  ['seek(t)', 'The page draws that moment: UI, type, mascot.'],
  ['Chromium', 'A headless browser captures 1920 × 1080.'],
  ['60 fps · MP4', '3,420 frames, encoded with the mixed sound.'],
]

function Idea() {
  return (
    <Slide page="03">
      <Header eyebrow="02 — THE IDEA" headline={<Headline n={3} w={791} h={217}>Every frame is a function of time.</Headline>}>
        A film is a web page. Nothing animates live: every frame is computed from one number, the time, then captured by a headless browser. Any frame renders the same, in any order, on any machine.
      </Header>
      <ol className={styles.pipeline}>
        {STEPS.map(([title, body], i) => (
          <li key={title} className={styles.nightCard}>
            <span className={`${styles.mono} ${styles.blue400}`}>{String(i + 1).padStart(2, '0')}</span>
            <p className={styles.titleCard}>{title}</p>
            <p className={`${styles.bodyS} ${styles.muted}`}>{body}</p>
          </li>
        ))}
      </ol>
      <p className={`${styles.nightCard} ${styles.code}`}>
        <code>window.seek = (t) =&gt; scenes.forEach((scene) =&gt; scene(t))</code>
        <code className={styles.codeComment}>// every frame is a pure function of time</code>
      </p>
    </Slide>
  )
}

const SYSTEM = [
  ['Brief', 'Purpose, audience, length and the licensed track.'],
  ['Brand', 'Tokens, the font file, the brand’s own rule names.'],
  ['Music map', 'Find the drop and the bar; cut on the beat.'],
  ['Storyboard', 'One idea per scene. Every line held at least 3 s.'],
  ['Real UI', 'Snapshot the live app as markup, never pixels.'],
  ['Build', 'Scenes as pure functions of time; the mascot carries the cuts.'],
  ['Stills', 'Check key moments and every transition first.'],
  ['Render + sound', 'Parallel render; every effect placed on its frame.'],
  ['QA', 'From the encoded file: 2 fps whole, 10 fps transitions.'],
]

function System() {
  return (
    <Slide page="04" light>
      <Header eyebrow="03 — THE SYSTEM" headline={<Headline n={4} w={585} h={217}>One system, nine steps.</Headline>}>
        Every film now runs through the same nine steps, captured as a reusable skill. A new film starts from the system, not from a blank page.
      </Header>
      <ol className={styles.grid3}>
        {SYSTEM.map(([title, body], i) => (
          <li key={title} className={styles.paperCard}>
            <span className={`${styles.mono} ${styles.blue600}`}>{String(i + 1).padStart(2, '0')}</span>
            <p className={styles.titleCard}>{title}</p>
            <p className={styles.bodyS}>{body}</p>
          </li>
        ))}
      </ol>
    </Slide>
  )
}

function RealUi() {
  return (
    <Slide page="05">
      <Header eyebrow="04 — REAL UI, NEVER PIXELS" headline={<Headline n={5} w={615} h={233}>Real UI. Never pixels.</Headline>}>
        We snapshot each real VO screen (its markup, styles, data, fonts and icons) and play it inside the film. The camera can push 3–4× into a single row and it stays as crisp as the headline.
      </Header>
      <div className={styles.grid2}>
        <figure className={styles.figure}>
          <Img name="zoom_dom" w={820} h={461} className={styles.glow} />
          <figcaption className={`${styles.mono} ${styles.green}`}>LIVE MARKUP AT 3× — SHARP</figcaption>
        </figure>
        <figure className={styles.figure}>
          <Img name="zoom_raster" w={820} h={461} className={styles.glow} />
          <figcaption className={`${styles.mono} ${styles.coral}`}>SCREEN RECORDING AT 3× — SOFT</figcaption>
        </figure>
      </div>
    </Slide>
  )
}

const SWATCHES = [
  ['Night', '#03070B'],
  ['Ink', '#000100'],
  ['Blue 600', '#3685BB'],
  ['Blue 400', '#6BAFDD'],
  ['Blue 200', '#B7D8F0'],
  ['Paper', '#F8F8F8'],
  ['Money Green', '#16A34A'],
  ['Coral', '#F55D3E'],
]

function Brand() {
  return (
    <Slide page="06" light>
      <div className={styles.split}>
        <div>
          <Eyebrow>05 — BRAND FOUNDATIONS</Eyebrow>
          <Headline n={6} w={601} h={217}>
            Ink on paper, lit blue.
          </Headline>
          <p className={styles.bodyL}>The films use the brand exactly: the Helvena font file, the token values from naxum.com, and the site’s own rule names as direction.</p>
          <p className={`${styles.mono} ${styles.muted}`}>TYPE — HELVENA SEMIBOLD · −4.5% TRACKING · 1.02 LEADING</p>
          <p className={`${styles.mono} ${styles.muted}`}>LABELS — MONO CAPS · BODY — THE SAME FAMILY</p>
          <ul className={styles.pills}>
            <li>Ink on paper, lit blue</li>
            <li>The night is the stage</li>
            <li className={styles.pillGreen}>Money is green</li>
          </ul>
        </div>
        <ul className={styles.swatches}>
          {SWATCHES.map(([name, hex]) => (
            <li key={name}>
              <span className={styles.swatch} style={{ background: hex }} />
              <span className={styles.swatchName}>{name}</span>
              <span className={`${styles.mono} ${styles.muted}`}>{hex}</span>
            </li>
          ))}
        </ul>
      </div>
    </Slide>
  )
}

function Mascot() {
  return (
    <Slide page="07" className={styles.cover}>
      <div className={styles.coverText}>
        <Eyebrow>06 — THE MASCOT</Eyebrow>
        <Headline n={7} w={654} h={233}>
          One mascot. One job.
        </Headline>
        <p className={styles.bodyL}>The AiBlob from the VO’s own Storybook is the transition element. It wakes, pokes, becomes the portal into the product and cheers from the side. It is never a person, and never sits on the logo.</p>
        <p className={`${styles.mono} ${styles.blue200}`}>WAKES · POKES · BECOMES THE PORTAL · CHEERS</p>
      </div>
      {/* The deck's two mascot pictures, made live: the real AiBlob, following the pointer. */}
      <div className={styles.pair}>
        <div className={`${styles.pairBig} ${styles.glow} ${styles.skinsCard}`}>
          <p className={styles.skinsTitle}>
            One character. <span>Every colour.</span>
          </p>
          <ul className={styles.skins}>
            {MASCOT_SKINS.map(([skin, name, note, glasses]) => (
              <li key={skin}>
                <AiBlob skin={skin} glasses={glasses} size="100%" />
                <span className={styles.skinName}>{name}</span>
                <span className={styles.skinNote}>{note}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={`${styles.pairSmall} ${styles.glow} ${styles.moodCard}`}>
          <div>
            <p className={styles.moodCount}>MOOD 02 / 08</p>
            <p className={styles.moodName}>Curious</p>
            <p className={styles.moodNote}>Following your cursor.</p>
          </div>
          <AiBlob mood="curious" size="100%" label="The NaXum assistant mascot, following your cursor" className={styles.moodBlob} />
        </div>
      </div>
    </Slide>
  )
}

// The skins in "One character. Every colour.": [skin, name, note, glasses].
const MASCOT_SKINS = [
  ['blue', 'Blue 500', '#4FA0D5', true],
  ['blue300', 'Blue 300', '#8DC1E6', true],
  ['blue800', 'Blue 800', '#245577', true],
  ['ink', 'Ink 900', '#1E201F', true],
  ['coral', 'Coral 500', '#F55D3E', true],
  ['sage', 'Sage 500', '#4E6E5D', true],
  ['paper', 'Paper', 'No glasses', false],
]

function People() {
  return (
    <Slide page="08" light>
      <div className={styles.split}>
        <div>
          <Eyebrow>07 — PEOPLE &amp; DATA</Eyebrow>
          <Headline n={8} w={564} h={217}>
            Real people. Real data.
          </Headline>
          <p className={styles.bodyL}>People are drawn avatars with real names from the enrollment tree: faces that fit the name, never initials, never mascots. Every number comes from real VO data, seeded safely and restored after filming.</p>
        </div>
        <Img name="ship_money" w={880} h={495} className={styles.lightShadow} />
      </div>
      <Img name="avatars" w={1500} h={200} className={styles.avatars} />
      <p className={`${styles.mono} ${styles.muted}`}>MAYA COLLINS · DANA REYES · MARCUS WEBB · PRIYA NAIR · TOM HALVORSEN · AISHA BELLO · KENJI WATANABE · ADA OKONKWO</p>
    </Slide>
  )
}

/*
  The motion language: six moves over two slides. Each row reads left to right: four real
  frames from the money flow film, then the move itself, playing.
*/
const MOVES = [
  ['portal', 'Portal', 'The mascot hops onto the full stop, turns into a doorway, and the product appears inside it.'],
  ['mask', 'Type mask', 'The words fill with the live product, then the camera flies through the letters.'],
  ['count', 'Count-up', 'A real number counts up from zero, then the row lights green with a ding.'],
  ['sweep', 'Green sweep', 'Each money row lights green on the beat: every level, every sale.'],
  ['split', 'Split & multiply', 'One member becomes two, then four, then a team that lands in the real tree.'],
  ['lock', 'Lockup', '“Welcome to”, the mascot drops in, then the wordmark joins it.'],
]

function MotionLanguage({ part }) {
  const moves = MOVES.slice((part - 1) * 3, part * 3)
  return (
    <Slide page={part === 1 ? '09' : '10'}>
      <Header eyebrow={`08 — MOTION LANGUAGE · ${part} OF 2`} headline={<Headline n={9} w={495} h={233}>A motion language.</Headline>}>
        Six moves we reuse in every film. Each carries meaning, never decoration. Read each row left to right: four real frames from the money flow film.
      </Header>
      <ol className={styles.moves}>
        {moves.map(([key, title, body], i) => (
          <li key={key} className={styles.moveRow}>
            <div className={styles.moveText}>
              <span className={`${styles.mono} ${styles.blue400}`}>{String((part - 1) * 3 + i + 1).padStart(2, '0')}</span>
              <p className={styles.titleCard}>{title}</p>
              <p className={`${styles.bodyXs} ${styles.muted}`}>{body}</p>
            </div>
            <ol className={styles.frames}>
              {[1, 2, 3, 4].map((n) => (
                <li key={n}>
                  <img className={styles.frame} src={`${A}moves/${key}${n}.webp`} alt="" width={262} height={147} loading="lazy" />
                  <span className={`${styles.mono} ${styles.muted}`}>{n}</span>
                </li>
              ))}
              <li className={styles.liveFrame}>
                <Loop src={`${A}moves/${key}-live.mp4`} poster={`${A}moves/${key}-live.webp`} className={styles.frame} label={`${title}, playing`} />
                <span className={`${styles.mono} ${styles.blue400}`}>LIVE</span>
              </li>
            </ol>
          </li>
        ))}
      </ol>
    </Slide>
  )
}

// A short silent animation that loops while it's on screen (and rests on its still otherwise).
function Loop({ src, poster, className = '', label }) {
  const video = useRef(null)
  useEffect(() => {
    const el = video.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(([entry]) => {
      // A browser may refuse to autoplay (data saver); the still stays up, which is fine.
      if (entry.isIntersecting) el.play().catch(() => {})
      else el.pause()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return <video ref={video} className={className} src={src} poster={poster} muted loop playsInline preload="none" aria-label={label} />
}

const SOUNDS = [
  ['POP', 'The signature: something landed'],
  ['DING', 'Money arrives', 'green'],
  ['TICK', 'Counters count'],
  ['CLICK', 'A press and its release'],
  ['BLOOP', 'A button goes down'],
  ['JELLY', 'The mascot’s squish'],
  ['WHOOSH', 'Air on big moves'],
  ['SUB', 'A low bloom under reveals'],
]

function Sound() {
  return (
    <Slide page="11" light>
      <div className={styles.split}>
        <div>
          <Eyebrow>09 — SOUND DESIGN</Eyebrow>
          <Headline n={10} w={738} h={217}>
            Every action makes a sound.
          </Headline>
          <p className={styles.bodyL}>Studied from a reference launch film: one signature sound for “something landed”, rhythm for quantity, silence before reveals. The music plays straight through, ducked under the UI and never cut.</p>
          <ul className={styles.sounds}>
            {SOUNDS.map(([name, body, tone]) => (
              <li key={name}>
                <img className={styles.soundDot} src={`${A}dot-sound-${tone === 'green' ? 2 : 1}.svg`} alt="" width={12} height={12} />
                <span>
                  <span className={`${styles.mono} ${styles.ink}`}>{name}</span>
                  <span className={styles.bodyXs}>{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.stack}>
          <figure className={styles.figure}>
            <Img name="spec_ours" w={860} h={201} className={styles.lightShadow} />
            <figcaption className={`${styles.mono} ${styles.muted}`}>OUR MIX — POPS AND DINGS CUT THROUGH THE MUSIC</figcaption>
          </figure>
          <figure className={styles.figure}>
            <Img name="spec_ref" w={860} h={203} className={styles.lightShadow} />
            <figcaption className={`${styles.mono} ${styles.muted}`}>THE REFERENCE — ONE SOUND, REUSED EVERYWHERE</figcaption>
          </figure>
        </div>
      </div>
    </Slide>
  )
}

const RULES = [
  ['“Too fast, I couldn’t read”', 'Hold every line at least 3 s'],
  ['“Images are blurry”', 'Build the exact UI; never zoom pixels'],
  ['“Don’t use mascots for people”', 'People are avatars with real names'],
  ['“Money stuff can be green”', 'Money is green; balances glow'],
  ['“Frames look really tight”', 'Windows ≤ 1240 px, air on every side'],
  ['“Too much space in between”', 'A headline and its subject are one group'],
  ['“Automatically doesn’t make sense”', 'No lone claims; show the proof'],
  ['“The music restarts”', 'The track plays straight through'],
  ['“Eyes outside the glasses”', 'One transform owner per element'],
  ['“Mascot on the logo”', 'Never cover the brand mark'],
  ['“From here it gets boring”', 'Every section needs a new idea'],
  ['“Check it”', 'QA from the encoded file, every cut'],
]

function Rules() {
  return (
    <Slide page="12">
      <Header eyebrow="10 — RULES WE EARNED" headline={<Headline n={11} w={448} h={233}>Rules we earned.</Headline>}>
        Every rule started as a note on a frame. Each is now part of the system, so no film repeats the mistake.
      </Header>
      <ul className={styles.grid3}>
        {RULES.map(([note, rule]) => (
          <li key={rule} className={`${styles.nightCard} ${styles.rule}`}>
            <p className={`${styles.bodyXs} ${styles.muted}`}>{note}</p>
            <p className={styles.ruleText}>{rule}</p>
          </li>
        ))}
      </ul>
    </Slide>
  )
}

const CHECKS = [
  ['Whole film at 2 fps', 'The story reads; nothing sits off-frame.'],
  ['Every transition at 10 fps', 'No double images, no slivers, no hard cuts.'],
  ['Full size at the deepest zoom', 'Every digit sharp after encoding.'],
  ['A spectrogram of the mix', 'The effects cut through the music.'],
  ['The database, table by table', 'Restored to the backup; nothing left behind.'],
]

function Qa() {
  return (
    <Slide page="13" light>
      <Eyebrow>11 — QA</Eyebrow>
      <Headline n={12} w={814} h={217}>
        Checked the way the client sees it.
      </Headline>
      <div className={styles.split}>
        <ul className={styles.numbered}>
          {CHECKS.map(([title, body]) => (
            <li key={title}>
              <span className={`${styles.titleCard} ${styles.green}`} aria-hidden="true">
                ✓
              </span>
              <div>
                <p className={styles.titleCard}>{title}</p>
                <p className={styles.bodyS}>{body}</p>
              </div>
            </li>
          ))}
        </ul>
        <figure className={styles.figure}>
          <Img name="qa_sheet" w={880} h={371} className={styles.lightShadow} />
          <figcaption className={`${styles.mono} ${styles.muted}`}>THE MONEY FLOW FILM — 48 FRAMES, START TO FINISH, FROM THE ENCODED FILE</figcaption>
        </figure>
      </div>
    </Slide>
  )
}

const SHIPPED = [
  ['newLook', 'ship_newlook', 'The new naxum.com', 'DESIGN SHOWREEL'],
  ['mascots', 'ship_mascots', 'Meet the assistant', 'MASCOT REEL'],
  ['ai', 'ship_ai', 'AI in the Virtual Office', 'NARRATED PRODUCT DEMO'],
  ['money', 'ship_money', 'Money flow', 'FEATURE FILM'],
]

const NUMBERS = [
  ['57 s', 'One film, one take of the music'],
  ['3,420', 'Frames, each computed, none recorded'],
  ['119', 'Sound effects, each on its frame'],
  ['25', 'Real people from the real tree'],
]

function Shipped() {
  return (
    <Slide page="14">
      <Eyebrow>12 — WHAT WE SHIPPED</Eyebrow>
      <Headline n={13} w={464} h={233}>
        What we shipped.
      </Headline>
      <ul className={styles.grid4}>
        {SHIPPED.map(([film, poster, title, label]) => (
          <li key={film} className={styles.shipped}>
            <Film film={films[film]} poster={poster} w={400} h={225} className={styles.glow} />
            <p className={styles.shippedTitle}>{title}</p>
            <p className={`${styles.mono} ${styles.blue200}`}>{label}</p>
          </li>
        ))}
      </ul>
      <ul className={styles.grid4}>
        {NUMBERS.map(([value, label]) => (
          <li key={label}>
            <p className={styles.stat}>{value}</p>
            <p className={`${styles.bodyXs} ${styles.muted}`}>{label}</p>
          </li>
        ))}
      </ul>
    </Slide>
  )
}

function Close() {
  return (
    <Slide page="15" className={styles.close}>
      <Headline n={14} w={1126} h={367}>
        Designed with intention.
      </Headline>
      <p className={styles.bodyL}>Everything in this deck became our motion design system. Every new film starts from it.</p>
      <img className={styles.wordmark} src={`${A}wordmark.svg`} alt="NaXum" width={320} height={73} />
    </Slide>
  )
}
