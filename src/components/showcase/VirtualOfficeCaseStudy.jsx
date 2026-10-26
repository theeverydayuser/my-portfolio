import { makeDeck } from './deck.jsx'
import styles from './deck.module.css'

/*
  "I rebuilt the back office": the Virtual Office case study, built from Mide's Figma deck
  (Portfolio · The Virtual Office, 16 slides). Words are the deck's, word for word; the
  headlines are its outlined Helvena artwork, the pictures its own exports. Where a slide
  overlaps pictures, a collage places each one by its share of the Figma frame (--x, --y, --w).
*/
const A = '/assets/naxum-vo/'
const { Slide, Headline, Img, Eyebrow } = makeDeck({ base: A, line: 'MIDE OTUTULORO · THE VIRTUAL OFFICE', total: 16 })

export default function VirtualOfficeCaseStudy() {
  return (
    <div className={styles.deck}>
      <Cover />
      <Brands />
      <OldOffice />
      <Journey />
      <NorthStar />
      <Shell />
      <Details />
      <SixteenDays />
      <Metrics />
      <Themes />
      <Modules />
      <OneDialog />
      <ShipEverywhere />
      <SelfServe />
      <LessCode />
      <Review />
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

function Cover() {
  return (
    <Slide page="01">
      <div className={styles.voSplit}>
        <div className={styles.coverText}>
          <Eyebrow>MIDE OTUTULORO · DESIGN ENGINEER</Eyebrow>
          <Headline n={1} w={734} h={283}>
            I rebuilt the back office.
          </Headline>
          <p className={styles.bodyL}>VP of Design &amp; Front-End at NaXum. I led the redesign, the design system and the team behind a white-label back office.</p>
          <p className={`${styles.mono} ${styles.blue400}`}>2023 → 2026 · 35+ BRANDS · ONE TEMPLATE</p>
        </div>
        <div className={styles.collage} style={{ '--ratio': '91.5%' }}>
          <Placed name="c_dark" x={15.9} y={0} w={81.8} alt="The redesigned dashboard in dark mode" />
          <Placed name="c_light" x={0} y={24.8} w={81.8} alt="The redesigned dashboard in light mode" />
          <Placed name="c_hits" x={36.4} y={48.4} w={63.6} ratio={[24.28, 18]} alt="The page hits report" />
        </div>
      </div>
    </Slide>
  )
}

const SKINS = ['rose', 'amber', 'coral', 'violet', 'green', 'blue']

function Brands() {
  return (
    <Slide page="02" light>
      <Eyebrow>01 — ONE TEMPLATE</Eyebrow>
      <Headline n={2} w={720} h={250}>
        One product. 35+ brands.
      </Headline>
      {/* Six brand skins of the same dashboard, fanned left to right, the first on top. */}
      <div className={styles.collage} style={{ '--ratio': '20.83%' }}>
        {SKINS.map((skin, i) => (
          <Placed key={skin} name={`skin_${skin}`} x={(5 - i) * 13.33} y={0} w={33.33} className={styles.lightShadow} alt={`The dashboard in the ${skin} brand skin`} />
        ))}
      </div>
      <dl className={styles.grid3}>
        <div>
          <dt className={`${styles.statXL} ${styles.blue600}`}>35+</dt>
          <dd className={styles.bodyS}>brands on one template</dd>
        </div>
        <div>
          <dt className={styles.statXL}>14</dt>
          <dd className={styles.bodyS}>white-label launches in 18 months</dd>
        </div>
        <div>
          <dt className={styles.statXL}>6</dt>
          <dd className={styles.bodyS}>themes, one codebase, zero forks</dd>
        </div>
      </dl>
    </Slide>
  )
}

const OLD = [
  ['23,094', 'lines in one global stylesheet'],
  ['4', 'colour variables. No tokens.'],
  ['3', 'UI kits: Bootstrap 4, jQuery, PrimeVue 3'],
  ['~10', 'DataTables packages'],
  ['5,148', 'lines in a single component'],
  ['2', 'state libraries side by side'],
]

function OldOffice() {
  return (
    <Slide page="03">
      <Eyebrow>02 — THE STARTING POINT</Eyebrow>
      <Headline n={3} w={857} h={217}>
        The old office was three systems.
      </Headline>
      <div className={styles.oldOffice}>
        <ul className={styles.grid3}>
          {OLD.map(([value, label]) => (
            <li key={label} className={styles.nightCard}>
              <p className={styles.statM}>{value}</p>
              <p className={`${styles.bodyS} ${styles.muted}`}>{label}</p>
            </li>
          ))}
        </ul>
        <div className={styles.lessonCard}>
          <p className={`${styles.mono} ${styles.blue400}`}>THE LESSON</p>
          <p className={styles.lessonTitle}>We cut the old app’s entry bundle by 80.6%. No click got faster.</p>
          <p className={`${styles.bodyM} ${styles.muted}`}>Payload and perceived speed are different problems. The fix was architecture, so the office was rebuilt on a template instead of patched again.</p>
        </div>
      </div>
    </Slide>
  )
}

const JOURNEY = [
  ['MAR 2023', 'Phoenix begins', 'A ground-up Vue rebuild of the back office.'],
  ['JUN 2023', 'The user flow', 'Every journey mapped before a screen was drawn.'],
  ['NOV 2023', 'A daily quality gate', 'Every front-end change checked, every working day.'],
  ['NOV 2024', 'First client migration', 'Menus, cart, reports and enrollment moved across.'],
  ['FEB 2025', 'Design system founded', 'Roadmap, governance model and Figma docs.'],
  ['MAR 2025', 'Storybook + PrimeVue', 'Components documented in Storybook from day one.'],
  ['DEC 2025', 'PrimeVue wrapped', 'Every molecule-level component wrapped once.'],
  ['FEB 2026', 'Token repository', 'Colour, type and space defined as tokens.'],
  ['JUL 2026', 'The redesign', 'A new shell to merged in 16 days.'],
  ['AUG–OCT 2026', 'Built on the system', 'Onboarding, quizzes, typography, dark mode.'],
]

function Journey() {
  return (
    <Slide page="04" light>
      <Eyebrow>03 — THE JOURNEY</Eyebrow>
      <Headline n={4} w={652} h={217}>
        Three years, one direction.
      </Headline>
      <ol className={styles.grid5}>
        {JOURNEY.map(([date, title, body]) => (
          <li key={date} className={styles.paperCard}>
            <p className={`${styles.mono} ${styles.blue600}`}>{date}</p>
            <p className={styles.titleCard}>{title}</p>
            <p className={styles.bodyS}>{body}</p>
          </li>
        ))}
      </ol>
    </Slide>
  )
}

function NorthStar() {
  return (
    <Slide page="05">
      <div className={styles.voSplit}>
        <div className={styles.coverText}>
          <Eyebrow>04 — DIRECTION</Eyebrow>
          <Headline n={5} w={569} h={250}>
            I set the North Star.
          </Headline>
          <p className={styles.northQuote}>“Don’t make me think.”</p>
          <p className={styles.bodyL}>Before building deep, I agreed one standard with the founder. Every screen since is tested against it.</p>
        </div>
        <div className={`${styles.collage} ${styles.dropRight}`} style={{ '--ratio': '83.9%' }}>
          <Placed name="ns_actions" x={0} y={0} w={100} ratio={[9, 2.3]} alt="Quick actions: add prospect, member, campaign, email, media" />
          <Placed name="ns_topbar" x={21.95} y={37.8} w={78.05} ratio={[6.4, 1.2]} alt="The top bar: setup guide, search and account" />
          <Placed name="ns_balance" x={0} y={61.05} w={31.7} ratio={[6.6, 6.8]} alt="The total balance card" />
          <p className={`${styles.mono} ${styles.blue400} ${styles.placedText}`} style={{ '--x': '36.6%', '--y': '75.6%' }}>
            FEWER CHOICES, CLEARER NEXT STEPS
          </p>
        </div>
      </div>
    </Slide>
  )
}

const SHELL = [
  ['Floating-panel canvas', 'Every page sits on one raised panel, so the chrome steps back.'],
  ['Nav rail', 'Built on PrimeVue Menu, with brand-locked icons from one resolver.'],
  ['Unified top bar', 'Search, language, theme and account in one row.'],
  ['Breadcrumbs on every page', 'I reversed an old “no breadcrumbs” rule once the rail grouped tools.'],
]

function Shell() {
  return (
    <Slide page="06" light>
      <Eyebrow>05 — THE SHELL</Eyebrow>
      <Headline n={6} w={539} h={217}>
        A new shell, on day one.
      </Headline>
      <div className={styles.shellRow}>
        <Img name="shell_dash" w={880} h={550} className={styles.lightShadow} alt="The new shell: nav rail, top bar, breadcrumbs and a floating panel" />
        <ul className={styles.stackList}>
          {SHELL.map(([title, body]) => (
            <li key={title} className={styles.paperCard}>
              <p className={styles.titleCard}>{title}</p>
              <p className={styles.bodyS}>{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </Slide>
  )
}

const DETAILS = [
  ['b_balance', 'TOTAL BALANCE'],
  ['b_actions', 'QUICK ACTIONS'],
  ['b_traffic', 'TRAFFIC CHART'],
  ['b_path', 'PATH BUILDER'],
  ['b_dialog', 'APPDIALOG'],
  ['b_menu', 'ROW MENU'],
  ['b_donut', 'TOP LOCATIONS'],
  ['b_darktable', 'DATATABLECARD · DARK'],
]

function Details() {
  return (
    <Slide page="07">
      <Eyebrow>06 — CRAFT</Eyebrow>
      <Headline n={7} w={722} h={233}>
        The details are the design.
      </Headline>
      <ul className={styles.grid4}>
        {DETAILS.map(([name, label]) => (
          <li key={name} className={`${styles.detail} ${name === 'b_darktable' ? styles.detailDark : ''}`}>
            <img src={`${A}${name}.webp`} alt={label.toLowerCase()} loading="lazy" />
            <span className={styles.detailLabel}>{label}</span>
          </li>
        ))}
      </ul>
    </Slide>
  )
}

/*
  The 16 days as a line of day ticks, with each milestone at its day (as in the deck):
  [date, what, day 0–16, above or below the line]. The last one, merged, is the big dot.
*/
const SPRINT = [
  ['JUL 14', 'Shell', 0, 'up'],
  ['JUL 15', 'Dashboard', 1, 'down'],
  ['JUL 17', 'Contacts', 3, 'up'],
  ['JUL 18', 'Media', 4, 'down'],
  ['JUL 21', 'Campaigns', 7, 'up'],
  ['JUL 22', 'Training', 8, 'down'],
  ['JUL 23', 'Money', 9, 'up'],
  ['JUL 24', 'Admin', 10, 'down'],
  ['JUL 25', 'One dialog', 11, 'up'],
  ['JUL 26', 'Borderless', 12, 'down'],
  ['JUL 27', 'Auth pages', 13, 'up'],
  ['JUL 29', 'Button sweep', 15, 'down'],
  ['JUL 30', 'Merged', 16, 'up'],
]

function SixteenDays() {
  return (
    <Slide page="08" light>
      <Eyebrow>07 — DELIVERY</Eyebrow>
      <Headline n={8} w={774} h={250}>
        Launch-ready in 16 days.
      </Headline>
      <ol className={styles.dayline}>
        {Array.from({ length: 17 }, (_, day) => (
          <li key={`tick-${day}`} className={styles.dayTick} style={{ '--at': `${day * 6.25}%` }} aria-hidden="true">
            <img src={`${A}dot_small.svg`} alt="" />
          </li>
        ))}
        {SPRINT.map(([date, what, day, side], i) => {
          const last = i === SPRINT.length - 1
          return (
            <li key={date} className={`${styles.dayEvent} ${side === 'up' ? styles.dayUp : styles.dayDown} ${last ? styles.dayLast : ''}`} style={{ '--at': `${day * 6.25}%` }}>
              <img className={styles.dayDot} src={`${A}${last ? 'dot_end' : 'dot_ring'}.svg`} alt="" />
              <span className={`${styles.dayDate} ${last ? styles.blue600 : ''}`}>{date}</span>
              <span className={`${styles.dayText} ${last ? styles.blue600 : ''}`}>{what}</span>
            </li>
          )
        })}
      </ol>
      <dl className={styles.statRow}>
        {[
          ['16', 'days'],
          ['702', 'files changed'],
          ['10', 'modules restyled'],
        ].map(([value, label]) => (
          <div key={label}>
            <dt className={styles.stat}>{value}</dt>
            <dd className={styles.bodyS}>{label}</dd>
          </div>
        ))}
      </dl>
    </Slide>
  )
}

const NUMBERS = [
  ['465', 'Vue components, every one on script setup'],
  ['20', 'core design-system primitives', true],
  ['31', 'shell components: rail, top bar, dialog'],
  ['89', 'design tokens, guarded by a test', true],
  ['210', 'icons in one registry'],
  ['57', 'Pinia setup stores'],
  ['34 / 51', 'composables / stateless helpers'],
  ['101', 'lazy-loaded translation namespaces'],
]

const CHIPS = ['DataTableCard', 'AppDialog', 'InnerNav', 'SegmentedTabs', 'InfoBanner', 'StatTiles', 'EmptyState', 'StatusBadge', 'HuePill', 'AppIconButton', 'AppTopBar', 'AppBreadcrumb', 'NavMenuItem', 'ThemeSelector', 'ConfigDrivenForm', 'ColumnManagerDrawer']

function Metrics() {
  return (
    <Slide page="09">
      <div className={styles.header}>
        <div>
          <Eyebrow>08 — THE SYSTEM</Eyebrow>
          <Headline n={9} w={609} h={233}>
            The system, in numbers.
          </Headline>
        </div>
        <p className={styles.bodyL}>Measured from the codebase today, October 2026.</p>
      </div>
      <ul className={styles.grid4}>
        {NUMBERS.map(([value, label, blue]) => (
          <li key={label} className={styles.nightCard}>
            <p className={`${styles.statM} ${blue ? styles.blue400 : ''}`}>{value}</p>
            <p className={`${styles.bodyS} ${styles.muted}`}>{label}</p>
          </li>
        ))}
      </ul>
      <p className={`${styles.mono} ${styles.blue400}`}>CORE + SHELL COMPONENTS</p>
      <ul className={styles.chips}>
        {CHIPS.map((chip, i) => (
          <li key={chip} className={i < 2 ? styles.blue400 : styles.blue200}>
            {chip}
          </li>
        ))}
      </ul>
    </Slide>
  )
}

function Themes() {
  return (
    <Slide page="10" light>
      <Eyebrow>09 — THEMES</Eyebrow>
      <Headline n={10} w={702} h={233}>
        Every screen, light and dark.
      </Headline>
      <div className={`${styles.collage} ${styles.liftUp}`} style={{ '--ratio': '40.1%' }}>
        <Placed name="ld_light" x={0} y={17.6} w={52.94} className={styles.lightShadow} alt="The dashboard in light mode" />
        <Placed name="ld_dark" x={47.06} y={0} w={52.94} alt="The dashboard in dark mode" />
        <p className={`${styles.mono} ${styles.blue600} ${styles.placedText}`} style={{ '--x': '56.5%', '--y': '88%' }}>
          DARK MODE FOLLOWS THE DEVICE · ONE TOKEN SET, TWO THEMES
        </p>
      </div>
    </Slide>
  )
}

const MODULES = [
  ['w_comm', 'w_path', 'w_contacts', 'w_share', 'w_store'],
  ['w_api', 'w_hits', 'w_actions', 'w_tree', 'w_brand'],
]

function Modules() {
  return (
    <Slide page="11">
      <Eyebrow>10 — THE REDESIGN</Eyebrow>
      <Headline n={11} w={964} h={233}>
        Fourteen modules, one language.
      </Headline>
      {/* Two rows of screens running off the slide's edges, the second shifted left. */}
      <div className={styles.moduleRows}>
        {MODULES.map((row, r) => (
          <ul key={r} className={styles.moduleRow}>
            {row.map((name) => (
              <li key={name}>
                <Img name={name} w={416} h={260} className={`${styles.glow} ${styles.screen}`} alt="" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </Slide>
  )
}

// 143 hand-built popups as a 13 × 11 grid of tiles: grey at varied strengths, a diagonal of coral.
const POPUPS = Array.from({ length: 143 }, (_, i) => {
  const row = Math.floor(i / 13)
  const col = i % 13
  return { coral: (((col - row) % 7) + 7) % 7 === 0, opacity: (35 + ((i * 37) % 60)) / 100 }
})

function OneDialog() {
  return (
    <Slide page="12" light>
      <Eyebrow>11 — SYSTEM THINKING</Eyebrow>
      <Headline n={12} w={642} h={250}>
        143 popups. One dialog.
      </Headline>
      <div className={styles.dialogRow}>
        <figure className={styles.figure}>
          <div className={styles.popups} aria-hidden="true">
            {POPUPS.map(({ coral, opacity }, i) => (
              <span key={i} className={coral ? styles.popupCoral : ''} style={{ opacity }} />
            ))}
          </div>
          <figcaption className={`${styles.mono} ${styles.coral}`}>143 HAND-BUILT POPUPS · 106 FILES</figcaption>
        </figure>
        <span className={styles.dialogArrow} aria-hidden="true">
          →
        </span>
        <figure className={styles.figure}>
          <Img name="d_dialog" w={560} h={362} className={styles.lightShadow} alt="The one AppDialog, here as Add Reminder" />
          <figcaption className={`${styles.mono} ${styles.blue600}`}>1 APPDIALOG · A TEST HOLDS IT AT ZERO</figcaption>
        </figure>
        <dl className={styles.dialogStats}>
          {[
            ['110 → 0', 'outlined buttons, one primitive edit'],
            ['78', 'status tags restyled, zero page edits'],
            ['521', 'field labels unified across 116 files'],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className={styles.stat}>{value}</dt>
              <dd className={styles.bodyS}>{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Slide>
  )
}

function ShipEverywhere() {
  return (
    <Slide page="13">
      <Eyebrow>12 — SCALE</Eyebrow>
      <Headline n={13} w={903} h={250}>
        Fix once, ship everywhere.
      </Headline>
      <div className={styles.voSplit}>
        <dl className={styles.stackList}>
          {[
            ['14', 'launches in 18 months', true],
            ['7', 'template syncs to one client in 4 weeks'],
            ['35+', 'brands, every fix shipped once'],
          ].map(([value, label, blue]) => (
            <div key={label}>
              <dt className={`${styles.statL} ${blue ? styles.blue400 : ''}`}>{value}</dt>
              <dd className={`${styles.bodyS} ${styles.muted}`}>{label}</dd>
            </div>
          ))}
        </dl>
        {/* The template in the middle, six branded offices around it on dashed links. */}
        <div className={`${styles.collage} ${styles.hubDiagram}`} style={{ '--ratio': '80.05%' }}>
          <img className={styles.placedArt} src={`${A}links.svg`} alt="" style={{ '--x': '14.78%', '--y': '11.54%', '--w': '70.39%' }} />
          <Placed name="r_blue" x={35.2} y={0} w={29.56} alt="" />
          <Placed name="r_green" x={70.39} y={19.23} w={29.56} alt="" />
          <Placed name="r_violet" x={70.39} y={57.69} w={29.56} alt="" />
          <Placed name="r_coral" x={35.2} y={76.92} w={29.56} alt="" />
          <Placed name="r_amber" x={0} y={57.69} w={29.56} alt="" />
          <Placed name="r_rose" x={0} y={19.23} w={29.56} alt="" />
          <img className={styles.placedArt} src={`${A}hub.svg`} alt="" style={{ '--x': '30.27%', '--y': '25.38%', '--w': '39.4%' }} />
          <p className={`${styles.mono} ${styles.hubLabel}`}>TEMPLATE</p>
        </div>
      </div>
    </Slide>
  )
}

const ADMIN_TASKS = ['Brand colour', 'Logo', 'Typeface', 'Menus', 'Page visibility', 'Section landings', 'Languages', 'Onboarding goals']

function SelfServe() {
  return (
    <Slide page="14" light>
      <Eyebrow>13 — PROCESS</Eyebrow>
      <Headline n={14} w={721} h={250}>
        No developer needed.
      </Headline>
      <div className={styles.selfServe}>
        <div className={styles.collage} style={{ '--ratio': '50.96%' }}>
          <Placed name="s_brand" x={0} y={0} w={80.77} className={styles.lightShadow} alt="Branding settings in light mode" />
          <Placed name="s_brand_dark" x={46.15} y={33.96} w={53.85} alt="Branding settings in dark mode" />
        </div>
        <div className={styles.coverText}>
          <p className={`${styles.mono} ${styles.blue600}`}>WHAT ADMINS NOW DO THEMSELVES</p>
          <ul className={styles.taskPills}>
            {ADMIN_TASKS.map((task) => (
              <li key={task}>
                <img src={`${A}pill_dot.svg`} alt="" />
                {task}
              </li>
            ))}
          </ul>
          <p className={styles.settingsLine}>Settings, not tickets.</p>
        </div>
      </div>
    </Slide>
  )
}

// Old generation against the new office, each bar as a share of the longest in its pair.
const BARS = [
  ['FRONT-END CODE', 100, '~197k lines', 78.68, '~155k lines'],
  ['VUE COMPONENTS', 78.49, '365', 100, '465'],
  ['DESIGN TOKENS', 4.49, '4', 100, '89'],
  ['DEPENDENCIES', 100, '52', 75, '39'],
  ['UI KITS', 100, '3', 33.33, '1'],
]

function LessCode() {
  return (
    <Slide page="15">
      <div className={styles.header}>
        <div>
          <Eyebrow>14 — RESULTS</Eyebrow>
          <Headline n={15} w={796} h={250}>
            Less code, more product.
          </Headline>
        </div>
        <ul className={styles.legend}>
          <li className={styles.coral}>
            <img src={`${A}dot_coral.svg`} alt="" />
            OLD GENERATION
          </li>
          <li className={styles.blue400}>
            <img src={`${A}dot_blue.svg`} alt="" />
            NEW OFFICE
          </li>
        </ul>
      </div>
      <dl className={styles.bars}>
        {BARS.map(([label, old, oldValue, now, nowValue]) => (
          <div key={label} className={styles.barRow}>
            <dt className={`${styles.mono} ${styles.muted}`}>{label}</dt>
            <dd className={styles.barPair}>
              <span className={styles.barLine}>
                <span className={`${styles.bar} ${styles.barOld}`} style={{ '--v': `${old}%` }} />
                <span className={`${styles.bodyS} ${styles.muted}`}>{oldValue}</span>
              </span>
              <span className={styles.barLine}>
                <span className={`${styles.bar} ${styles.barNew}`} style={{ '--v': `${now}%` }} />
                <span className={styles.bodyS}>{nowValue}</span>
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </Slide>
  )
}

const CHECKS = [
  ['lint', 'passed'],
  ['design tokens', '0 new hard-coded values'],
  ['dialogs', '0 raw popups'],
  ['icons', '1 registry'],
  ['front-end tests', '1,800+ passed'],
  ['backend tests', '6,500+ passed'],
]

// The loop's steps around the ring, as angles (degrees, counter-clockwise from the right).
const LOOP = [
  ['Plan', 90],
  ['Build', 18],
  ['Audit', -54],
  ['QA', -126],
  ['Ship', 162, true],
]

function Review() {
  return (
    <Slide page="16" light>
      <Eyebrow>15 — AUTOMATION</Eyebrow>
      <Headline n={16} w={632} h={250}>
        Review that runs itself.
      </Headline>
      <div className={styles.reviewRow}>
        <div className={styles.coverText}>
          <div className={styles.terminal}>
            <p className={styles.terminalDots} aria-hidden="true">
              <img src={`${A}term_red.svg`} alt="" />
              <img src={`${A}term_amber.svg`} alt="" />
              <img src={`${A}term_green.svg`} alt="" />
            </p>
            <p className={styles.muted}>$ git commit</p>
            <dl>
              {CHECKS.map(([check, result]) => (
                <div key={check}>
                  <dt>
                    <span className={styles.green}>✓</span> {check}
                  </dt>
                  <dd className={styles.blue200}>{result}</dd>
                </div>
              ))}
            </dl>
            <p className={`${styles.mono} ${styles.blue400}`}>HOOKS RAN · PROOF PRINTED</p>
          </div>
          <p className={`${styles.mono} ${styles.blue600}`}>194 RULES · 62 MR AUDITS · 80+ LEARNED RULES</p>
        </div>
        <div className={styles.loop}>
          <img className={styles.loopRing} src={`${A}ring.webp`} alt="" />
          <p className={styles.loopCentre}>
            <span className={styles.loopTitle}>Claude Code</span>
            <span className={styles.bodyS}>reads my rules first</span>
          </p>
          {LOOP.map(([step, angle, lead]) => (
            <span
              key={step}
              className={`${styles.loopStep} ${lead ? styles.loopLead : ''}`}
              style={{ '--x': `${50 + 50 * Math.cos((angle * Math.PI) / 180)}%`, '--y': `${50 - 50 * Math.sin((angle * Math.PI) / 180)}%` }}
            >
              {step}
            </span>
          ))}
        </div>
      </div>
    </Slide>
  )
}
