import { makeDeck } from './deck.jsx'
import styles from './deck.module.css'

/*
  "I founded the design system": the design-system case study, built from Mide's Figma deck
  (Portfolio · Design system, 14 slides). Words are the deck's, word for word; the headlines
  are its outlined Helvena artwork, the pictures its own exports. The code cards, token chart
  and terminal are drawn in HTML so their text stays crisp.
*/
const A = '/assets/naxum-ds/'
const { Slide, Headline, Img, Eyebrow } = makeDeck({ base: A, line: 'MIDE OTUTULORO · THE DESIGN SYSTEM', total: 14 })

export default function DesignSystemCaseStudy() {
  return (
    <div className={styles.deck}>
      <Cover />
      <Problem />
      <Journey />
      <Roadmap />
      <Governance />
      <Tokens />
      <Type />
      <Themes />
      <Components />
      <Art />
      <Guards />
      <Sweep />
      <Numbers />
      <Close />
    </div>
  )
}

// A picture placed in a collage: x, y and w are percentages of the collage box.
function Placed({ name, x, y, w, ratio = [16, 10], alt = '', className = styles.glow }) {
  return (
    <div className={styles.placed} style={{ '--x': `${x}%`, '--y': `${y}%`, '--w': `${w}%` }}>
      <Img name={name} w={ratio[0] * 100} h={ratio[1] * 100} className={className} alt={alt} />
    </div>
  )
}

// Big numbers with a line under each; `cols` are the deck's column widths, in deck pixels.
function Stats({ items, cols, className = styles.stat, labelClass = styles.bodyM }) {
  return (
    <dl className={`${styles.statRow} ${styles.statCols}`} style={{ '--cols': cols.map((c) => `calc(${c} * var(--u))`).join(' ') }}>
      {items.map(([value, label]) => (
        <div key={label}>
          <dt className={className}>{value}</dt>
          <dd className={labelClass}>{label}</dd>
        </div>
      ))}
    </dl>
  )
}

// The cover's token card: a swatch and a name per token. `swatch` is a class for its colour.
const TOKENS = [
  ['--vo-surface', styles.swatchSurface],
  ['--vo-text-primary', styles.swatchPaper],
  ['--vo-progress-fill', styles.swatchBlue],
  ['--vo-pill-success-bg', styles.swatchGreen],
  ['--vo-nav-accent', styles.swatchCoral],
]

function Cover() {
  return (
    <Slide page="01">
      <div className={styles.voSplit}>
        <div className={styles.coverText}>
          <Eyebrow>MIDE OTUTULORO · DESIGN ENGINEER</Eyebrow>
          <Headline n={1} w={814} h={250}>
            I founded the design system.
          </Headline>
          <p className={styles.bodyL}>VP of Design &amp; Front-End at NaXum. I wrote the roadmap and the rules, then turned them into the tokens every client brand runs on.</p>
          <Stats
            cols={[280, 280, 280]}
            className={`${styles.stat} ${styles.blue400}`}
            labelClass={`${styles.bodyM} ${styles.muted}`}
            items={[
              ['15', 'roadmap items'],
              ['89', 'design tokens'],
              ['14 → 1', 'font files to one token'],
            ]}
          />
          <p className={`${styles.mono} ${styles.blue400} ${styles.pre}`}>{'2025 → 2026  ·  ROADMAP  ·  TOKENS  ·  STORYBOOK'}</p>
        </div>
        <div className={styles.collage} style={{ '--ratio': '88.9%' }}>
          <Placed name="c_blue" x={26.67} y={0} w={71.11} alt="The dashboard in the blue brand" />
          <Placed name="c_coral" x={13.33} y={21.25} w={71.11} alt="The dashboard in the coral brand" />
          <Placed name="c_green" x={0} y={42.5} w={71.11} alt="The dashboard in the green brand" />
          <div className={`${styles.placed} ${styles.tokenCard}`} style={{ '--x': '55.56%', '--y': '48.75%', '--w': '44.44%' }}>
            <p className={styles.tokenCardTitle}>TOKENS</p>
            <ul>
              {TOKENS.map(([name, swatch]) => (
                <li key={name}>
                  <span className={swatch} />
                  {name}
                </li>
              ))}
            </ul>
            <p className={styles.blue400}>+ 84 more</p>
          </div>
        </div>
      </div>
    </Slide>
  )
}

// Three pages, each styled by hand, fanned and tilted: [label, lines, tilt, x %, y %].
// A line in blue is a component rather than a style.
const HAND_STYLED = [
  ['PAGE A · STYLED BY HAND', ['font-family: "Montserrat";', 'font-size: 13px;', 'background: #f4f4f4;', 'border: 1px solid #ddd;'], 3, 26.1, 2.2],
  ['PAGE B · STYLED BY HAND', ['font-size: 13px;', 'background: #f4f4f4;', 'border: 1px solid #ddd;', '<Button outlined />'], -2, 14.7, 26.2],
  ['PAGE C · STYLED BY HAND', ['background: #f4f4f4;', 'border: 1px solid #ddd;', '<Button outlined />', 'font-family: "Montserrat";'], 2, 0.54, 56.9],
]

function Problem() {
  return (
    <Slide page="02" light>
      <div className={styles.voSplit} style={{ '--l': '880fr', '--r': '850fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>01 — THE PROBLEM</Eyebrow>
          <Headline n={2} w={827} h={250}>
            Every page was a one-off.
          </Headline>
          <p className={styles.bodyL}>35+ client brands ran on one back office, and every page was styled by hand. Nothing stopped the next one-off.</p>
          <Stats
            cols={[290, 290, 290]}
            items={[
              ['110', 'outlined buttons'],
              ['57', 'files they lived in'],
              ['14', 'files typing the font'],
            ]}
          />
        </div>
        <div className={`${styles.collage} ${styles.aiDrop}`} style={{ '--ratio': '84.9%', '--drop': 20 }} aria-label="Three pages, each styled by hand" role="img">
          {HAND_STYLED.map(([label, lines, tilt, x, y]) => (
            <div key={label} className={styles.handCard} style={{ '--x': `${x}%`, '--y': `${y}%`, '--tilt': `${tilt}deg` }}>
              <p className={styles.blue600}>{label}</p>
              {lines.map((line) => (
                <code key={line} className={line.startsWith('<') ? styles.blue600 : ''}>
                  {line}
                </code>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Slide>
  )
}

/* Nine milestones, evenly along the line (as in the deck): [date, what, side]. */
const MILESTONES = [
  ['JAN 2025', 'Roadmap group', 'up'],
  ['FEB 2025', 'Governance model', 'down'],
  ['MAR 2025', 'Storybook', 'up'],
  ['AUG 2025', 'Colour system', 'down'],
  ['DEC 2025', 'PrimeVue wrapped', 'up'],
  ['FEB 2026', 'Token repo', 'down'],
  ['JUL 2026', 'New VO polish', 'up'],
  ['AUG 2026', 'Design guard', 'down'],
  ['SEP 2026', 'One font token', 'up'],
]

function Journey() {
  return (
    <Slide page="03">
      <Eyebrow>02 — THE JOURNEY</Eyebrow>
      <Headline n={3} w={731} h={250}>
        Roadmap to rules that run.
      </Headline>
      <ol className={`${styles.dayline} ${styles.daylinePlain}`}>
        {MILESTONES.map(([date, what, side], i) => {
          const first = i === 0
          const last = i === MILESTONES.length - 1
          return (
            <li
              key={date}
              className={`${styles.dayEvent} ${side === 'up' ? styles.dayUp : styles.dayDown} ${last ? styles.dayLast : ''} ${first ? styles.dayStart : ''} ${last ? styles.dayEnd : ''}`}
              style={{ '--at': `${i * 12.5}%` }}
            >
              <img className={styles.dayDot} src={`${A}${last ? 'dot_end' : 'dot_ring'}.svg`} alt="" />
              <span className={styles.dayDate}>{date}</span>
              <span className={styles.dayText}>{what}</span>
            </li>
          )
        })}
      </ol>
      <Stats
        cols={[420, 420, 420]}
        className={`${styles.stat} ${styles.blue400}`}
        labelClass={`${styles.bodyM} ${styles.muted}`}
        items={[
          ['20', 'months, roadmap to font token'],
          ['9', 'milestones'],
          ['1', 'owner'],
        ]}
      />
    </Slide>
  )
}

const JOBS = [
  'Tokens & visual language',
  'Framework & library',
  'Theming & tokens',
  'Accessibility standards',
  'Component development',
  'Tokens & variables',
  'Dev workflow',
  'Team training & adoption',
  'Monitor & iterate',
  'Component & UX inventory',
  'Codebase audit',
  'Brand & theming review',
  'Theming architecture',
  'Storybook documentation',
  'Chromatic UI review',
]

function Roadmap() {
  return (
    <Slide page="04" light>
      <div className={styles.voSplit} style={{ '--l': '860fr', '--r': '818fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>03 — THE ROADMAP</Eyebrow>
          <Headline n={4} w={768} h={250}>
            Fifteen jobs, one roadmap.
          </Headline>
          <p className={styles.bodyL}>In January 2025 I asked for a design-system roadmap group. In February I wrote its 15 jobs, then started on them.</p>
        </div>
        <ol className={`${styles.grid3} ${styles.dsJobs} ${styles.aiDrop}`} style={{ '--drop': 20 }}>
          {JOBS.map((job, i) => (
            <li key={job}>
              <span className={`${styles.mono} ${styles.blue600}`}>{String(i + 1).padStart(2, '0')}</span>
              {job}
            </li>
          ))}
        </ol>
      </div>
    </Slide>
  )
}

const RULES = [
  ['VSG-068', 'Type sizes come from tokens', 'never a typed number'],
  ['VSG-069', 'Surfaces come from tokens', 'never a raw hex colour'],
  ['VSG-074', 'Every list overlay reads the same', 'one look, set once'],
]

function Governance() {
  return (
    <Slide page="05">
      <div className={styles.voSplit} style={{ '--l': '880fr', '--r': '800fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>04 — GOVERNANCE</Eyebrow>
          <Headline n={5} w={587} h={283}>
            Rules, not taste.
          </Headline>
          <p className={styles.bodyL}>A governance model first. Then rules anyone can check: the file, the line, the fix.</p>
          <Stats
            cols={[300, 300]}
            className={`${styles.stat} ${styles.blue400}`}
            labelClass={`${styles.bodyM} ${styles.muted}`}
            items={[
              ['194', 'audit rules'],
              ['77', 'of them visual'],
            ]}
          />
        </div>
        <ul className={`${styles.stackList} ${styles.dsRules} ${styles.aiDrop}`} style={{ '--drop': 30 }}>
          {RULES.map(([code, rule, note]) => (
            <li key={code}>
              <span className={styles.blue400}>{code}</span>
              <strong>{rule}</strong>
              <span className={`${styles.bodyM} ${styles.muted}`}>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </Slide>
  )
}

// The --vo-* token families and how many tokens each holds.
const FAMILIES = [
  ['pill', 19],
  ['text', 13],
  ['overlay', 9],
  ['goal', 8],
  ['art', 8],
  ['flag', 7],
  ['surface', 5],
  ['nav', 5],
  ['field', 4],
  ['tabs', 3],
  ['progress', 3],
  ['font', 3],
  ['popup', 1],
  ['hue', 1],
]

function Tokens() {
  return (
    <Slide page="06" light>
      <div className={styles.voSplit} style={{ '--l': '840fr', '--r': '860fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>05 — TOKENS</Eyebrow>
          <Headline n={6} w={657} h={250}>
            89 tokens, every brand.
          </Headline>
          <p className={styles.bodyL}>Every size, colour and surface is a named token. A client brand changes the values, never the components.</p>
          <Stats
            cols={[300, 300]}
            items={[
              ['89', 'tokens'],
              ['14', 'families'],
            ]}
          />
        </div>
        <div className={`${styles.familyCard} ${styles.aiDrop}`} style={{ '--drop': 10 }}>
          <p className={`${styles.mono} ${styles.blue600}`}>--vo-* TOKEN FAMILIES</p>
          <dl>
            {FAMILIES.map(([family, count], i) => (
              <div key={family}>
                <dt>{family}</dt>
                <dd>
                  <span className={i === 0 ? styles.familyTop : ''} style={{ '--n': count / 19 }} />
                  {count}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Slide>
  )
}

const AFTER_TOKENS = [
  ['--vo-font-sans', ': "Franie", sans-serif;'],
  ['--vo-font-scale', ': 0.88;'],
  ['--vo-text-h1', ': calc(16px * var(--vo-font-scale));'],
]

function Type() {
  return (
    <Slide page="07">
      <div className={styles.voSplit} style={{ '--l': '840fr', '--r': '860fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>06 — TYPE</Eyebrow>
          <Headline n={7} w={766} h={233}>
            14 files became one token.
          </Headline>
          <p className={styles.bodyL}>The typeface was typed by hand into 14 files. Now it is one token with a size scale, and each client can set it.</p>
          <Stats
            cols={[300, 300]}
            className={`${styles.stat} ${styles.blue400}`}
            labelClass={`${styles.bodyM} ${styles.muted}`}
            items={[
              ['14', 'files before'],
              ['1', 'token after'],
            ]}
          />
        </div>
        <div className={`${styles.typeCards} ${styles.aiDrop}`} style={{ '--drop': 20 }}>
          <div className={styles.codeCard}>
            <p className={`${styles.codeCardLabel} ${styles.muted}`}>BEFORE · 14 FILES</p>
            {[1, 0.8, 0.6, 0.4].map((opacity) => (
              <code key={opacity} style={{ opacity }}>
                font-family: &quot;Montserrat&quot;;
              </code>
            ))}
            <p className={`${styles.codeCardMore} ${styles.muted}`}>… and 10 more files</p>
          </div>
          <img className={styles.typeArrow} src={`${A}arrow_down.svg`} alt="" width={40} height={60} />
          <div className={`${styles.codeCard} ${styles.codeCardLit}`}>
            <p className={`${styles.codeCardLabel} ${styles.blue400}`}>AFTER · 1 TOKEN</p>
            {AFTER_TOKENS.map(([name, value]) => (
              <code key={name}>
                <span className={styles.blue400}>{name}</span>
                {value}
              </code>
            ))}
            <p className={`${styles.bodyM} ${styles.muted}`}>Clients pick their own typeface. Every size follows.</p>
          </div>
        </div>
      </div>
    </Slide>
  )
}

const SKINS = ['blue', 'coral', 'green', 'violet', 'amber', 'rose']

function Themes() {
  return (
    <Slide page="08" light>
      <div className={styles.voSplit} style={{ '--l': '860fr', '--r': '840fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>07 — THEMES</Eyebrow>
          <Headline n={8} w={586} h={250}>
            Light, dark, any brand.
          </Headline>
          <p className={styles.bodyL}>One token set drives light mode, dark mode and every client colour. Dark mode follows the device.</p>
          <ul className={styles.skinRow}>
            {SKINS.map((skin) => (
              <li key={skin}>
                <Img name={`skin_${skin}`} w={1800} h={1125} className={styles.lightShadow} alt={`The dashboard in the ${skin} brand`} />
                <span>{skin}</span>
              </li>
            ))}
          </ul>
          <p className={`${styles.mono} ${styles.blue600} ${styles.pre}`}>{'ONE TOKEN SET  ·  SIX OF 35+ BRANDS'}</p>
        </div>
        <div className={`${styles.collage} ${styles.aiDrop}`} style={{ '--ratio': '85.36%', '--drop': 20 }}>
          <Placed name="light" x={0} y={0} w={90.48} className={styles.lightShadow} alt="The dashboard in light mode" />
          <Placed name="dark" x={16.67} y={39.05} w={83.33} className={styles.lightShadow} alt="The dashboard in dark mode" />
        </div>
      </div>
    </Slide>
  )
}

const PARTS = [
  ['k_dialog', 'DIALOG'],
  ['k_menu', 'ROW MENU'],
  ['k_chart', 'TRAFFIC CHART'],
  ['k_balance', 'BALANCE CARD'],
]

function Components() {
  return (
    <Slide page="09">
      <div className={styles.voSplit} style={{ '--l': '860fr', '--r': '840fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>08 — COMPONENTS</Eyebrow>
          <Headline n={9} w={844} h={217}>
            Built on PrimeVue, wrapped once.
          </Headline>
          <p className={styles.bodyL}>PrimeVue underneath, our components on top. One wrapper per part, so a fix lands everywhere at once.</p>
          <Stats
            cols={[300, 300]}
            className={`${styles.stat} ${styles.blue400}`}
            labelClass={`${styles.bodyM} ${styles.muted}`}
            items={[
              ['20', 'core components'],
              ['167', 'icon-button uses'],
            ]}
          />
        </div>
        <ul className={`${styles.dsParts} ${styles.aiDrop}`} style={{ '--drop': 30 }}>
          {PARTS.map(([name, label]) => (
            <li key={name}>
              <img src={`${A}${name}.webp`} alt={label.toLowerCase()} loading="lazy" />
              <span className={styles.blue400}>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </Slide>
  )
}

const ART = ['calendar', 'video', 'message', 'money', 'people', 'award', 'workflow', 'order']

function Art() {
  return (
    <Slide page="10" light>
      <div className={styles.voSplit} style={{ '--l': '860fr', '--r': '840fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>09 — ART DIRECTION</Eyebrow>
          <Headline n={10} w={819} h={233}>
            Our own art, not stock icons.
          </Headline>
          <p className={styles.bodyL}>Lit 3D art, drawn for the product and rendered by our own components. One style on every screen, in every brand.</p>
          <Stats
            cols={[340, 340]}
            items={[
              ['7', 'onboarding illustrations'],
              ['5', 'Storybook stories'],
            ]}
          />
        </div>
        <div className={`${styles.coverText} ${styles.aiDrop}`} style={{ '--drop': 60 }}>
          <ul className={styles.artGrid}>
            {ART.map((name) => (
              <li key={name}>
                <img src={`${A}art_${name}.webp`} alt="" loading="lazy" width={480} height={480} />
                <span>{name}</span>
              </li>
            ))}
          </ul>
          <p className={`${styles.mono} ${styles.blue600} ${styles.artNote}`}>USED IN ONBOARDING AND EMPTY STATES</p>
        </div>
      </div>
    </Slide>
  )
}

const GUARDS = ['design tokens: typography + surface colour', '--vo-* design tokens', 'list overlays: central chrome']

function Guards() {
  return (
    <Slide page="11">
      <div className={styles.voSplit} style={{ '--l': '840fr', '--r': '860fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>10 — GUARDRAILS</Eyebrow>
          <Headline n={11} w={711} h={250}>
            The system checks itself.
          </Headline>
          <p className={styles.bodyL}>Three automated tests guard the system. Each keeps a baseline of old debt, so the count can only go down.</p>
          <Stats
            cols={[300, 300]}
            className={`${styles.stat} ${styles.blue400}`}
            labelClass={`${styles.bodyM} ${styles.muted}`}
            items={[
              ['3', 'guard tests'],
              ['0', 'new violations allowed'],
            ]}
          />
        </div>
        <div className={`${styles.dsTerm} ${styles.aiDrop}`} style={{ '--drop': 50 }}>
          <p className={styles.terminalDots} aria-hidden="true">
            <img src={`${A}term_dot.svg`} alt="" />
            <img src={`${A}term_dot.svg`} alt="" />
            <img src={`${A}term_dot.svg`} alt="" />
          </p>
          <p className={styles.muted}>$ npm run test:unit</p>
          <ul>
            {GUARDS.map((guard) => (
              <li key={guard}>
                <span className={styles.passBadge}>PASS</span>
                {guard}
              </li>
            ))}
          </ul>
          <p className={`${styles.blue400} ${styles.pre} ${styles.dsTermFoot}`}>{'3 guards  ·  baselines only tighten'}</p>
        </div>
      </div>
    </Slide>
  )
}

function Sweep() {
  return (
    <Slide page="12" light>
      <div className={styles.voSplit} style={{ '--l': '880fr', '--r': '820fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>11 — THE SWEEP</Eyebrow>
          <Headline n={12} w={653} h={250}>
            One button, 167 places.
          </Headline>
          <p className={styles.bodyL}>In the redesign I swept out every outlined button and moved row actions onto one icon button. One theme rule now styles every stepper.</p>
          <Stats
            cols={[340, 240, 240]}
            items={[
              ['110', 'outlined buttons removed'],
              ['57', 'files swept'],
              ['8', 'steppers, one rule'],
            ]}
          />
        </div>
        <div className={`${styles.sweepCard} ${styles.aiDrop}`} style={{ '--drop': 40 }}>
          <p className={styles.sweepLabel}>BEFORE</p>
          <ul className={styles.sweepBefore}>
            {['Edit', 'Delete', 'Share'].map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
          <p className={`${styles.sweepLabel} ${styles.sweepAfterLabel} ${styles.blue600} ${styles.pre}`}>{'AFTER  ·  ONE ICON BUTTON, 167 PLACES'}</p>
          <ul className={styles.sweepAfter}>
            {['edit', 'delete', 'share'].map((icon) => (
              <li key={icon}>
                <img src={`${A}ic_${icon}.svg`} alt={icon} />
              </li>
            ))}
          </ul>
          <p className={styles.bodyM}>Borderless, one hover state, one accessible name. Change it once and every table follows.</p>
          <img className={styles.sweepRows} src={`${A}rows.svg`} alt="" width={764} height={220} />
        </div>
      </div>
    </Slide>
  )
}

function Numbers() {
  return (
    <Slide page="13">
      <Eyebrow>12 — IN NUMBERS</Eyebrow>
      <Headline n={13} w={652} h={250}>
        The system, in numbers.
      </Headline>
      <Stats
        cols={[560, 560, 560]}
        className={`${styles.statHuge} ${styles.blue400}`}
        labelClass={`${styles.bodyM} ${styles.muted}`}
        items={[
          ['15', 'roadmap items'],
          ['89', 'design tokens'],
          ['194', 'audit rules'],
          ['3', 'guard tests'],
          ['167', 'icon-button uses'],
          ['14 → 1', 'font files to one token'],
        ]}
      />
    </Slide>
  )
}

function Close() {
  return (
    <Slide page="14" light>
      <div className={styles.aiClose}>
        <Eyebrow>MIDE OTUTULORO · NAXUM</Eyebrow>
        <Headline n={14} w={1260} h={312}>
          Decide once. Reuse everywhere.
        </Headline>
        <div className={styles.voSplit} style={{ '--l': '1080fr', '--r': '620fr', '--g': 0 }}>
          <div className={styles.coverText}>
            <p className={styles.bodyL}>From a roadmap in January 2025 to a system that checks itself, behind every brand on the back office.</p>
            <p className={`${styles.mono} ${styles.blue600} ${styles.pre}`}>{'VP OF DESIGN & FRONT-END  ·  DESIGN ENGINEER'}</p>
          </div>
          <Img name="close" w={1800} h={1125} className={styles.lightShadow} alt="The dashboard, light mode" />
        </div>
      </div>
    </Slide>
  )
}
