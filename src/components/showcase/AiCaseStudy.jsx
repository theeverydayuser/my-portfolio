import AiBlob from './AiBlob.jsx'
import { makeDeck } from './deck.jsx'
import styles from './deck.module.css'

/*
  "I owned the AI, end to end": the AI V1 case study, built from Mide's Figma deck
  (Portfolio · AI V1, 14 slides). Words are the deck's, word for word; the headlines are its
  outlined Helvena artwork, the pictures its own exports. The deck's mascot pictures are made
  live, as in the motion case study: the real AiBlob, in the mood and skin each picture shows.
*/
const A = '/assets/naxum-ai/'
const { Slide, Headline, Img, Eyebrow, Header } = makeDeck({ base: A, line: 'MIDE OTUTULORO · AI IN THE VIRTUAL OFFICE', total: 14 })

export default function AiCaseStudy() {
  return (
    <div className={styles.deck}>
      <Cover />
      <Journey />
      <Ownership />
      <Drafts />
      <Character />
      <Editor />
      <Pricing />
      <Seats />
      <SelfServe />
      <Knowledge />
      <Guardrails />
      <Tested />
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

// Big numbers with a line under each, in columns `col` deck pixels apart.
function Stats({ items, col, className = styles.stat, labelClass = styles.bodyS }) {
  return (
    <dl className={styles.statRow} style={{ '--col': col }}>
      {items.map(([value, label]) => (
        <div key={label}>
          <dt className={className}>{value}</dt>
          <dd className={labelClass}>{label}</dd>
        </div>
      ))}
    </dl>
  )
}

function Cover() {
  return (
    <Slide page="01">
      <div className={styles.voSplit}>
        <div className={styles.coverText}>
          <Eyebrow>MIDE OTUTULORO · DESIGN ENGINEER</Eyebrow>
          <Headline n={1} w={873} h={283}>
            I owned the AI, end to end.
          </Headline>
          <p className={styles.bodyL}>VP of Design &amp; Front-End at NaXum. I took our first AI feature from a one-page vision to its first client: the product, the pricing, every screen and the team.</p>
          <p className={`${styles.mono} ${styles.blue400} ${styles.pre}`}>{'JUL → OCT 2026  ·  15 WEEKS  ·  AI V1'}</p>
        </div>
        <div className={styles.collage} style={{ '--ratio': '86.5%' }}>
          <Placed name="cv_dark" x={16.28} y={0} w={83.72} alt="The AI assistant in dark mode" />
          <Placed name="cv_light" x={0} y={30.91} w={83.72} alt="The AI assistant drafting a campaign, in light mode" />
          <div className={styles.placed} style={{ '--x': '68%', '--y': '72.6%', '--w': '23.3%' }}>
            <AiBlob mood="happy" skin="sage" size="100%" label="The assistant’s mascot, following your cursor" />
          </div>
        </div>
      </div>
    </Slide>
  )
}

/* The 15 weeks as milestones along one line (as in the deck): [date, what, where (%), side]. */
const WEEKS = [
  ['JUL 9', 'Vision', 0, 'up'],
  ['JUL 23', 'Deadline set', 13.46, 'down'],
  ['AUG 6', 'Pricing stories', 26.92, 'up'],
  ['AUG 13', 'Top-up flow', 33.65, 'down'],
  ['SEP 17', 'Pricing live', 67.31, 'up'],
  ['SEP 25', 'Model simplified', 75, 'down'],
  ['OCT 1', 'Test gate', 80.77, 'up'],
  ['OCT 21', 'First client', 100, 'down'],
]

function Journey() {
  return (
    <Slide page="02" light>
      <Eyebrow>01 — THE JOURNEY</Eyebrow>
      <Headline n={2} w={798} h={250}>
        Vision to client in 15 weeks.
      </Headline>
      <ol className={styles.dayline}>
        {WEEKS.map(([date, what, at, side], i) => {
          const last = i === WEEKS.length - 1
          return (
            <li key={date} className={`${styles.dayEvent} ${side === 'up' ? styles.dayUp : styles.dayDown} ${last ? styles.dayLast : ''}`} style={{ '--at': `${at}%` }}>
              <img className={styles.dayDot} src={`${A}${last ? 'dot_end' : 'dot_ring'}.svg`} alt="" />
              <span className={styles.dayDate}>{date}</span>
              <span className={styles.dayText}>{what}</span>
            </li>
          )
        })}
      </ol>
      <Stats
        col={420}
        items={[
          ['15', 'weeks, vision to first client'],
          ['30+', 'money flows tested by hand'],
          ['4', 'launch bugs caught first'],
        ]}
      />
    </Slide>
  )
}

const JOBS = [
  ['t1', '01  PRODUCT', 'Wrote the vision and every story'],
  ['t2', '02  PRICING', 'Credits per action, seats per office'],
  ['t3', '03  DESIGN', 'Every member and owner screen'],
  ['t4', '04  FRONT END', 'Built the screens and the credits flow'],
  ['t5', '05  CHARACTER', 'Gave the assistant a face'],
  ['t6', '06  QUALITY', 'Ran the test gate before launch'],
]

function Ownership() {
  return (
    <Slide page="03">
      <Header eyebrow="02 — OWNERSHIP" headline={<Headline n={3} w={614} h={250}>Six jobs, one owner.</Headline>}>
        I led the backend engineers. Everything a member or an owner sees, decides or pays for came through me.
      </Header>
      <ul className={styles.grid3}>
        {JOBS.map(([name, label, title]) => (
          <li key={name} className={styles.aiTile}>
            <img src={`${A}${name}.webp`} alt="" loading="lazy" />
            <div>
              <p className={`${styles.mono} ${styles.blue400} ${styles.pre}`}>{label}</p>
              <p className={styles.aiTileTitle}>{title}</p>
            </div>
          </li>
        ))}
      </ul>
    </Slide>
  )
}

function Drafts() {
  return (
    <Slide page="04" light>
      <div className={styles.voSplit}>
        <div className={styles.coverText}>
          <Eyebrow>03 — THE ASSISTANT</Eyebrow>
          <Headline n={4} w={641} h={250}>
            It drafts. You decide.
          </Headline>
          <p className={styles.bodyL}>It never acts alone. The assistant proposes, the member reviews, and only then is a campaign created.</p>
          <ol className={styles.aiSteps}>
            <li>{'1   Describe'}</li>
            <li>{'2   Review'}</li>
            <li className={styles.aiStepLead}>{'3   Create'}</li>
          </ol>
          <p className={`${styles.mono} ${styles.blue600}`}>A PERSON CONFIRMS EVERY ACTION</p>
        </div>
        <div className={`${styles.collage} ${styles.aiDrop}`} style={{ '--ratio': '94.27%', '--drop': 50 }}>
          <Placed name="drafts" x={0} y={0} w={100} alt="The assistant’s chat, with past sessions" />
          <Placed name="drafts_card" x={29.27} y={47.87} w={68.29} ratio={[15, 10.8]} alt="A drafted campaign, created only after review" />
        </div>
      </div>
    </Slide>
  )
}

// The eight moods, each in the skin the deck shows it in.
const MOODS = [
  ['neutral', 'blue'],
  ['curious', 'blue300'],
  ['hmm', 'ink'],
  ['happy', 'sage'],
  ['surprised', 'coral'],
  ['sad', 'blue800'],
  ['angry', 'coral'],
  ['sleepy', 'blue800'],
]

function Character() {
  return (
    <Slide page="05">
      <Header eyebrow="04 — THE CHARACTER" headline={<Headline n={5} w={764} h={250}>A character, not a chatbot.</Headline>}>
        I gave the assistant a face. It is the avatar on every reply, and each of its eight moods means something real in the product.
      </Header>
      <ul className={styles.grid4}>
        {MOODS.map(([mood, skin]) => (
          <li key={mood} className={styles.aiMood}>
            <AiBlob mood={mood} skin={skin} size="100%" label={`The mascot, ${mood}`} className={styles.aiMoodBlob} />
            <span className={`${styles.mono} ${styles.blue600}`}>{mood.toUpperCase()}</span>
          </li>
        ))}
      </ul>
    </Slide>
  )
}

function Editor() {
  return (
    <Slide page="06" light>
      <div className={styles.voSplit} style={{ '--l': '860fr', '--r': '839fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>05 — EDITOR ASSIST</Eyebrow>
          <Headline n={6} w={709} h={250}>
            AI where you already write.
          </Headline>
          <p className={styles.bodyL}>Select text in any email, say what to change, then apply or discard. The writing stays the member’s.</p>
          <Img name="assist_pop" w={362} h={282} className={`${styles.lightShadow} ${styles.aiPop}`} alt="AI Assist, open over a selection" />
        </div>
        <div className={styles.aiDrop} style={{ '--drop': 50 }}>
          <Img name="assist" w={900} h={814} className={styles.lightShadow} alt="Send Email, with AI Assist rewriting the body" />
        </div>
      </div>
    </Slide>
  )
}

const PRICES = [
  ['30', 'credits for a chat turn'],
  ['50', 'credits for an editor revision'],
  ['70', 'credits for a campaign draft'],
]

function Pricing() {
  return (
    <Slide page="07">
      <div className={styles.voSplit} style={{ '--l': '880fr', '--r': '700fr', '--g': 120 }}>
        <div className={styles.coverText}>
          <Eyebrow>06 — PRICING</Eyebrow>
          <Headline n={7} w={879} h={233}>
            Credits, not price, are the hero.
          </Headline>
          <dl className={styles.aiPrices}>
            {PRICES.map(([value, label]) => (
              <div key={label}>
                <dt className={`${styles.statHuge} ${styles.blue400}`}>{value}</dt>
                <dd className={`${styles.bodyM} ${styles.muted}`}>{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Img name="plans" w={680} h={816} className={styles.glow} alt="Set up AI: the Pro, Elite and Growth plans" />
      </div>
    </Slide>
  )
}

function Seats() {
  return (
    <Slide page="08" light>
      <div className={styles.voSplit} style={{ '--l': '600fr', '--r': '1060fr', '--g': 40 }}>
        <div className={styles.coverText}>
          <Eyebrow>07 — THE BUSINESS MODEL</Eyebrow>
          <Headline n={8} w={462} h={250}>
            Sold by the seat.
          </Headline>
          <p className={styles.bodyL}>Owners turn AI on for a member category and pay per seat. The plan starts the moment the payment clears.</p>
        </div>
        <div className={`${styles.collage} ${styles.aiDrop}`} style={{ '--ratio': '75%', '--drop': 30 }}>
          <Placed name="owner" x={18.87} y={0} w={81.13} ratio={[16, 9]} className={styles.lightShadow} alt="The owner’s AI overview, seats by member category" />
          <Placed name="review" x={0} y={46.54} w={49.06} ratio={[6.76, 5.52]} className={styles.lightShadow} alt="Set up AI: the review step before payment" />
        </div>
      </div>
    </Slide>
  )
}

function SelfServe() {
  return (
    <Slide page="09">
      <div className={styles.voSplit} style={{ '--l': '880fr', '--r': '800fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>08 — SELF-SERVE</Eyebrow>
          <Headline n={9} w={765} h={250}>
            Members buy. Never ask.
          </Headline>
          <p className={styles.bodyL}>Out of credits? Members buy more in a few clicks, instead of waiting on their admin.</p>
        </div>
        <div className={`${styles.collage} ${styles.aiDrop}`} style={{ '--ratio': '90%', '--drop': 30 }}>
          <Placed name="buy" x={0} y={0} w={70} ratio={[5.8, 6]} alt="Buy AI credits" />
          <Placed name="credits" x={52.5} y={44.44} w={47.5} ratio={[3.8, 4]} alt="Credits left, from the plan and bought" />
        </div>
      </div>
    </Slide>
  )
}

function Knowledge() {
  return (
    <Slide page="10" light>
      <div className={styles.voSplit} style={{ '--l': '840fr', '--r': '860fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>09 — KNOWLEDGE</Eyebrow>
          <Headline n={10} w={774} h={250}>
            Grounded in their business.
          </Headline>
          <p className={styles.bodyL}>Owners upload their brand and offer documents, and the assistant writes from them. Every session is kept, so members pick up where they left off.</p>
        </div>
        <div className={`${styles.collage} ${styles.aiDrop}`} style={{ '--ratio': '95.35%', '--drop': 30 }}>
          <Placed name="replay" x={0} y={0} w={100} ratio={[16, 9]} className={styles.lightShadow} alt="A saved session, replayed" />
          <Placed name="knowledge" x={55.81} y={47.56} w={43.6} ratio={[5.16, 5.92]} className={styles.lightShadow} alt="Upload a brand document" />
        </div>
      </div>
    </Slide>
  )
}

const GUARDRAILS = ['A person confirms everything it creates', 'Every request is checked for unsafe content', 'Personal details masked before the model sees them', 'Every action is logged for the owner', 'Staff viewing as a member can’t spend their credits']

function Guardrails() {
  return (
    <Slide page="11">
      <div className={styles.voSplit} style={{ '--l': '880fr', '--r': '820fr', '--g': 0 }}>
        <div className={styles.coverText}>
          <Eyebrow>10 — GUARDRAILS</Eyebrow>
          <Headline n={11} w={747} h={250}>
            Safe by construction.
          </Headline>
          <ul className={styles.aiBullets}>
            {GUARDRAILS.map((rule) => (
              <li key={rule}>
                <img src={`${A}bullet.svg`} alt="" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.aiDrop} style={{ '--drop': 180 }}>
          <Img name="usage" w={1600} h={900} className={styles.glow} alt="The owner’s usage log: actions, credits and campaigns by day" />
        </div>
      </div>
    </Slide>
  )
}

const CAUGHT = ['Seats billed twice on activation', 'A deploy that switched AI back on', 'A replay that re-ran a top-up', 'A free plan the checkout should have refused']

function Tested() {
  return (
    <Slide page="12" light>
      <Eyebrow>11 — QUALITY</Eyebrow>
      <Headline n={12} w={617} h={250}>
        Tested like money.
      </Headline>
      <div className={styles.voSplit} style={{ '--l': '880fr', '--r': '820fr', '--g': 0 }}>
        <dl className={styles.aiTested}>
          <div>
            <dt className={`${styles.statHuge} ${styles.statGiant}`}>30+</dt>
            <dd className={styles.bodyM}>money flows I tested end to end, each with a screenshot</dd>
          </div>
          <div>
            <dt className={`${styles.statHuge} ${styles.statGiant} ${styles.blue600}`}>4</dt>
            <dd className={styles.bodyM}>launch bugs caught before a client saw them</dd>
          </div>
        </dl>
        <ul className={styles.stackList}>
          {CAUGHT.map((bug) => (
            <li key={bug} className={styles.bugCard}>
              <p className={`${styles.mono} ${styles.blue600}`}>CAUGHT</p>
              <p className={styles.bugTitle}>{bug}</p>
            </li>
          ))}
        </ul>
      </div>
    </Slide>
  )
}

function Numbers() {
  return (
    <Slide page="13">
      <Eyebrow>12 — IN NUMBERS</Eyebrow>
      <Headline n={13} w={637} h={250}>
        AI V1, in numbers.
      </Headline>
      <Stats
        col={560}
        className={`${styles.statHuge} ${styles.blue400}`}
        labelClass={`${styles.bodyM} ${styles.muted}`}
        items={[
          ['15', 'weeks from vision to first client'],
          ['3', 'priced actions: chat, revise, draft'],
          ['8', 'moods for one character'],
          ['1,229', 'automated tests guarding it'],
          ['39', 'database migrations'],
          ['83', 'backend services, built by the team I led'],
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
        <Headline n={14} w={1140} h={312}>
          Imagined. Priced. Shipped.
        </Headline>
        <div className={styles.aiCloseMascot}>
          <AiBlob mood="neutral" skin="blue300" size="100%" label="The assistant’s mascot, following your cursor" />
        </div>
        <div className={styles.voSplit} style={{ '--l': '1080fr', '--r': '620fr', '--g': 0 }}>
          <div className={styles.coverText}>
            <p className={styles.bodyL}>Cleared for its first client on 21 October 2026, the same day our new website went live.</p>
            <p className={`${styles.mono} ${styles.blue600} ${styles.pre}`}>{'VP OF DESIGN & FRONT-END  ·  DESIGN ENGINEER'}</p>
          </div>
          <Img name="cl_dark" w={1600} h={1000} className={styles.glow} alt="The assistant in dark mode" />
        </div>
      </div>
    </Slide>
  )
}
