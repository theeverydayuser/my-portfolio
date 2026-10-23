import { makeDeck } from './deck.jsx'
import styles from './deck.module.css'

/*
  "How I took a corporate site from WordPress to React in 23 days without losing its
  rankings": the naxum.com case study, built from Mide's Figma deck (Case study · naxum.com
  in 23 days, 15 slides). Words are the deck's, word for word; the headlines are its outlined
  Helvena artwork, the pictures its own exports.
*/
const A = '/assets/naxum-site/'
const { Slide, Headline, Img, Eyebrow, Header } = makeDeck({ base: A, line: 'NAXUM.COM · WORDPRESS TO REACT', total: 15 })

export default function NaxumSiteCaseStudy() {
  return (
    <div className={styles.deck}>
      <Cover />
      <Results />
      <Owned />
      <TwentyThreeDays />
      <WhyLeave />
      <BeforeAfter />
      <PageByPage />
      <BrandFirst />
      <OneSystem />
      <EveryScreen />
      <Writers />
      <SalesSites />
      <Rankings />
      <Runbook />
      <DayEarly />
    </div>
  )
}

function Cover() {
  return (
    <Slide page="01">
      <Eyebrow>CASE STUDY · NAXUM.COM</Eyebrow>
      <Headline n={1} w={1239} h={283}>
        WordPress to React in 23 days.
      </Headline>
      <div className={styles.siteCover}>
        <div className={styles.coverText}>
          <p className={styles.bodyL}>How I took NaXum’s corporate site off WordPress and onto React in 23 days, and kept every search ranking it had earned.</p>
          <p className={`${styles.mono} ${styles.blue200} ${styles.monoLines}`}>
            <span>23 DAYS · 105 REDIRECTS</span>
            <span>718 POSTS MOVED · ZERO DOWNTIME</span>
          </p>
        </div>
        <div className={styles.sitePair}>
          <figure className={styles.sitePairAfter}>
            <Img name="after_home" w={800} h={450} className={styles.glow} alt="The new naxum.com home page" />
            <span className={`${styles.tag} ${styles.green}`}>AFTER · REACT</span>
          </figure>
          <figure className={styles.sitePairBefore}>
            <Img name="before_home" w={420} h={236} className={styles.glow} alt="The old naxum.com home page on WordPress" />
            <span className={`${styles.tag} ${styles.coral}`}>BEFORE · WORDPRESS</span>
          </figure>
        </div>
      </div>
    </Slide>
  )
}

const OLD_SITE = [
  ['A theme, not a system', 'Pages built one by one, with stock photos and long feature lists.'],
  ['Three domains', 'The site, the blog and the sales sites each lived on their own domain.'],
  ['Years of leftovers', '175 URLs in the sitemap, with duplicates like /core-values-2.'],
  ['A shop nobody used', 'Cart, checkout and shop pages still live from an old store.'],
]

function WhyLeave() {
  return (
    <Slide page="05">
      <div className={styles.split}>
        <div>
          <Eyebrow>04 — THE BET</Eyebrow>
          <Headline n={2} w={590} h={217}>
            Why leave WordPress?
          </Headline>
          <blockquote className={styles.siteQuote}>“Beat every direct-selling website out there.”</blockquote>
          <p className={`${styles.mono} ${styles.muted}`}>— MY PROPOSAL TO LEADERSHIP, SEP 28</p>
          <p className={styles.bodyL}>A redesign was already under way inside WordPress. I proposed stopping it and rebuilding the site in React instead, so the company’s front door could match the product behind it.</p>
        </div>
        <ul className={styles.siteCards}>
          {OLD_SITE.map(([title, body]) => (
            <li key={title} className={styles.nightCard}>
              <p className={styles.siteCardTitle}>{title}</p>
              <p className={`${styles.bodyS} ${styles.muted}`}>{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </Slide>
  )
}

function BeforeAfter() {
  return (
    <Slide page="06" light>
      <Header eyebrow="05 — BEFORE & AFTER" headline={<Headline n={3} w={900} h={200}>Same company. New first impression.</Headline>}>
        The old site said a lot and showed little: stock photos, long lists, video embeds. The new one leads with one promise and the product itself.
      </Header>
      <div className={styles.grid2}>
        <figure className={styles.figure}>
          <Img name="before_home" w={820} h={461} className={styles.lightShadow} alt="The old home page" />
          <figcaption className={`${styles.mono} ${styles.coral}`}>BEFORE · WORDPRESS</figcaption>
        </figure>
        <figure className={styles.figure}>
          <Img name="after_home" w={820} h={461} className={styles.lightShadow} alt="The new home page" />
          <figcaption className={`${styles.mono} ${styles.green}`}>AFTER · REACT</figcaption>
        </figure>
      </div>
    </Slide>
  )
}

const PAGES = [
  ['about', 'ABOUT · BEFORE'],
  ['prod', 'PRODUCT · BEFORE'],
  ['comp', 'LEADERSHIP · BEFORE'],
]

function PageByPage() {
  return (
    <Slide page="07" light>
      <Header eyebrow="06 — PAGE BY PAGE" headline={<Headline n={4} w={642} h={217}>Page by page, a new story.</Headline>}>
        The same pages, rewritten around one idea each: say what it does, then show the product doing it.
      </Header>
      <ul className={styles.grid3}>
        {PAGES.map(([key, label]) => (
          <li key={key} className={styles.beforeAfterStack}>
            <p className={`${styles.mono} ${styles.coral}`}>{label}</p>
            <Img name={`b_${key}`} w={540} h={304} className={styles.lightShadow} alt={`${label.split(' ·')[0].toLowerCase()} page, before`} />
            <Img name={`a_${key}`} w={540} h={304} className={`${styles.lightShadow} ${styles.afterOver}`} alt={`${label.split(' ·')[0].toLowerCase()} page, after`} />
          </li>
        ))}
      </ul>
      <p className={`${styles.mono} ${styles.green}`}>AFTER ↓</p>
    </Slide>
  )
}

/*
  The 23 days as a timeline, each event at its place along the line (as in the deck):
  [date, what happened, where along the line (%), above or below it].
*/
const DAYS = [
  ['SEP 28', 'Proposed moving off WordPress', 0, 'up'],
  ['SEP 29', 'Moodboard and brand guide', 4.35, 'down'],
  ['OCT 5', 'Landing page prototype', 30.4, 'up'],
  ['OCT 7', 'Product pages', 39.1, 'down'],
  ['OCT 9', 'Full brief and repo', 47.8, 'up'],
  ['OCT 12', 'Done on staging, a day early', 60.9, 'down'],
  ['OCT 19', 'Re-QA passed', 91.3, 'up'],
  ['OCT 21', 'Live', 100, 'down'],
]

function TwentyThreeDays() {
  return (
    <Slide page="04">
      <Header eyebrow="03 — THE 23 DAYS" headline={<Headline n={5} w={713} h={217}>Proposal to live in 23 days.</Headline>}>
        Design and build ran side by side. The site was done on staging a day early, which left a full week for QA before launch.
      </Header>
      <ol className={styles.timeline}>
        {DAYS.map(([date, what, at, side], i) => {
          const last = i === DAYS.length - 1
          return (
            <li key={date} className={`${styles.event} ${side === 'up' ? styles.eventUp : styles.eventDown} ${at > 85 ? styles.eventEnd : ''}`} style={{ '--at': `${at}%` }}>
              <img className={styles.eventDot} src={`${A}dot-${last ? 'green' : 'blue'}.svg`} alt="" />
              <span className={`${styles.mono} ${last ? styles.green : styles.blue400}`}>{date}</span>
              <span className={styles.eventText}>{what}</span>
            </li>
          )
        })}
      </ol>
      <p className={`${styles.mono} ${styles.muted}`}>23 DAYS FROM PROPOSAL TO PRODUCTION</p>
    </Slide>
  )
}

function BrandFirst() {
  return (
    <Slide page="08" light>
      <div className={styles.split}>
        <div>
          <Eyebrow>07 — BRAND FIRST</Eyebrow>
          <Headline n={6} w={507} h={217}>
            Brand first, then code.
          </Headline>
          <p className={styles.bodyL}>Before a single page, a moodboard and a brand style guide. Colour, type, spacing, radius and the logo became tokens, and the code uses them by name, so design and code can’t drift apart.</p>
          <ul className={styles.pills}>
            <li>Ink on paper, lit blue</li>
            <li className={styles.pillCoral}>Coral is news</li>
            <li className={styles.pillGreen}>Sage is paid</li>
          </ul>
        </div>
        <figure className={styles.figure}>
          <div className={styles.brandPair}>
            <Img name="brand_colour" w={430} h={425} className={styles.lightShadow} alt="The NaXum logo and colour board" />
            <Img name="brand_type" w={430} h={376} className={`${styles.lightShadow} ${styles.brandLow}`} alt="The NaXum type board" />
          </div>
          <figcaption className={`${styles.mono} ${styles.muted}`}>THE NAXUM FOUNDATIONS BOARD — LOGO, COLOUR, TYPE</figcaption>
        </figure>
      </div>
    </Slide>
  )
}

function OneSystem() {
  return (
    <Slide page="09">
      <Header eyebrow="08 — THE SYSTEM" headline={<Headline n={7} w={585} h={217}>One system, every page.</Headline>}>
        21 page templates on one set of components and tokens: products, services, four audience pages, team, careers, the blog, press and contact.
      </Header>
      <Img name="wall" w={1680} h={525} className={styles.glow} alt="A wall of the site's 21 page templates" />
    </Slide>
  )
}

function EveryScreen() {
  return (
    <Slide page="10" light>
      <div className={styles.split}>
        <div>
          <Eyebrow>09 — MOBILE</Eyebrow>
          <Headline n={8} w={613} h={217}>
            Every screen, every size.
          </Headline>
          <p className={styles.bodyL}>Every page was designed for the phone as carefully as the desktop. Same story, same proof, in one hand.</p>
          <p className={`${styles.mono} ${styles.muted}`}>THE LIVE SITE AT 390 PX</p>
        </div>
        <ul className={styles.phones}>
          {[
            ['mob_home', 'The home page on a phone'],
            ['mob_services', 'The services page on a phone'],
            ['mob_blog', 'The blog on a phone'],
          ].map(([name, alt]) => (
            <li key={name}>
              <Img name={name} w={300} h={650} className={styles.phone} alt={alt} />
            </li>
          ))}
        </ul>
      </div>
    </Slide>
  )
}

const FLOW = [
  ['THE WRITERS', 'Publish in WordPress, as they always have.'],
  ['WORDPRESS', 'Stays as the writing tool, behind the scenes.'],
  ['THE NEW SITE', 'Reads the posts and refreshes every hour.'],
  ['NAXUM.COM/BLOG', 'Every post, in the new design, same address.'],
]

function Writers() {
  return (
    <Slide page="11">
      <Header eyebrow="10 — THE BLOG" headline={<Headline n={9} w={571} h={217}>The writers didn’t move.</Headline>}>
        The content team kept writing in WordPress, exactly as before. The new site reads every published post and shows it in the new design.
      </Header>
      <ol className={styles.flow}>
        {FLOW.map(([label, body]) => (
          <li key={label} className={styles.nightCard}>
            <span className={`${styles.mono} ${styles.blue400}`}>{label}</span>
            <p className={styles.flowText}>{body}</p>
          </li>
        ))}
      </ol>
      <ul className={styles.grid3}>
        {[
          ['718', 'posts moved, from 2014 to today', true],
          ['1 hr', 'from publish to live on naxum.com'],
          ['1 : 1', 'post addresses, so every link redirects exactly'],
        ].map(([value, label, green]) => (
          <li key={value}>
            <p className={`${styles.stat} ${green ? styles.green : ''}`}>{value}</p>
            <p className={`${styles.bodyS} ${styles.muted}`}>{label}</p>
          </li>
        ))}
      </ul>
    </Slide>
  )
}

const SALES = [
  ['Their name stays on every click', 'Every link a visitor follows keeps the salesperson’s name.'],
  ['Signups are credited', 'Anyone who books from their link is theirs.'],
  ['No duplicate content', 'Their copies tell Google not to index, so the company page keeps its ranking.'],
  ['One domain, not two', 'The old sales-site domain moved onto naxum.com.'],
]

function SalesSites() {
  return (
    <Slide page="12" light>
      <div className={styles.split}>
        <div>
          <Eyebrow>11 — SALES SITES</Eyebrow>
          <Headline n={10} w={844} h={217}>
            Every salesperson gets a site.
          </Headline>
          <p className={styles.bodyL}>The sales sites used to live on their own domain. Now every salesperson shares naxum.com itself, and the signups it brings in are credited to them.</p>
        </div>
        <div className={styles.stack}>
          <div>
            <p className={styles.urlPill}>
              naxum.com/<span>maya</span>/services
            </p>
            <p className={`${styles.mono} ${styles.muted}`}>A SALESPERSON’S OWN LINK TO THE SERVICES PAGE</p>
          </div>
          <ul className={styles.grid2}>
            {SALES.map(([title, body]) => (
              <li key={title} className={styles.paperCard}>
                <p className={styles.siteCardTitle}>{title}</p>
                <p className={styles.bodyS}>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Slide>
  )
}

const REDIRECTS = [
  ['/meet-the-team/', '/about/team', '301'],
  ['/naxum-history', '/about', '301'],
  ['/cart', 'Gone', '410'],
  ['naxumblog.com/<post>/', 'naxum.com/blog/<post>', '301'],
]

function Rankings() {
  return (
    <Slide page="13">
      <Header eyebrow="12 — KEEPING THE RANKINGS" headline={<Headline n={11} w={782} h={217}>Every old URL has a new home.</Headline>}>
        Before launch I pulled every URL from the old sitemap and gave each one a destination. Google keeps the ranking when the page moves in one clean hop.
      </Header>
      <div className={styles.split}>
        <ul className={styles.grid2}>
          {[
            ['175', 'old URLs, mapped one by one'],
            ['105', 'permanent 301 redirects, one hop each'],
            ['52', 'retired pages answer 410, so Google drops them cleanly'],
            ['718', 'blog posts moved, same addresses under /blog', true],
          ].map(([value, label, green]) => (
            <li key={value}>
              <p className={`${styles.stat} ${green ? styles.green : ''}`}>{value}</p>
              <p className={`${styles.bodyS} ${styles.muted}`}>{label}</p>
            </li>
          ))}
        </ul>
        <div className={`${styles.nightCard} ${styles.redirects}`}>
          <p className={`${styles.redirectRow} ${styles.redirectHead}`}>
            <span>OLD ADDRESS</span>
            <span />
            <span>NEW ADDRESS</span>
            <span />
          </p>
          {REDIRECTS.map(([from, to, code]) => (
            <p key={from} className={styles.redirectRow}>
              <span className={styles.blue200}>{from}</span>
              <span className={styles.muted}>→</span>
              <span>{to}</span>
              <span className={code === '410' ? styles.coral : styles.green}>{code}</span>
            </p>
          ))}
          <p className={`${styles.bodyXs} ${styles.muted}`}>One hop, no chains: an old address with or without its trailing slash lands on its new page in a single redirect.</p>
        </div>
      </div>
    </Slide>
  )
}

const RUNBOOK = [
  ['Open the blog to Google', 'Make /blog indexable and add every post to the sitemap.'],
  ['Deploy', 'Ship the new site from the main branch.'],
  ['Move the domain', 'Point naxum.com and www at the new site through Cloudflare.'],
  ['Redirect the old blog', '14 rules on the old blog domain, the catch-all last.'],
  ['Test old links', 'Open real old addresses and check each lands on its new page.'],
  ['Add both domains', 'Set up naxum.com and the old blog domain in Search Console.'],
  ['File the change of address', 'Tell Google the old blog domain has moved to naxum.com.'],
  ['Keep the old domain', 'Renew it for years, so the redirects keep working.'],
]

function Runbook() {
  return (
    <Slide page="14" light>
      <Header eyebrow="13 — THE CUTOVER RUNBOOK" headline={<Headline n={12} w={570} h={217}>The cutover runbook.</Headline>}>
        Written before launch day and followed step by step, so going live was a checklist, not a gamble.
      </Header>
      <ol className={styles.grid2}>
        {RUNBOOK.map(([title, body], i) => (
          <li key={title} className={styles.paperCard}>
            <p className={styles.runbookTitle}>
              <span className={`${styles.mono} ${styles.blue600}`}>{String(i + 1).padStart(2, '0')}</span>
              {title}
            </p>
            <p className={styles.bodyS}>{body}</p>
          </li>
        ))}
      </ol>
    </Slide>
  )
}

const LAST_WEEK = [
  ['OCT 12', 'Full site on staging', 'Due Oct 13. Blog, legal pages, redirects and the launch checklist included.'],
  ['OCT 14', 'Sales sites added', 'Every salesperson’s link working on the new domain.'],
  ['OCT 15', 'Review issues fixed', 'Every finding from the operations review closed.'],
  ['OCT 19', 'Re-review passed', 'Signed off and ready for launch.'],
  ['OCT 20', 'Go-live approved', 'The runbook sent to the team that runs the domains.'],
  ['OCT 21', 'Live', 'On time, “without a single hiccup.”'],
]

function DayEarly() {
  return (
    <Slide page="15" light>
      <Header eyebrow="14 — QUALITY" headline={<Headline n={13} w={514} h={217}>Done a day early.</Headline>}>
        The full site reached staging a day before its due date. That bought a full week of review before anyone outside saw it.
      </Header>
      <ul className={styles.grid3}>
        {LAST_WEEK.map(([date, title, body], i) => (
          <li key={date} className={styles.paperCard}>
            <span className={`${styles.mono} ${i === LAST_WEEK.length - 1 ? styles.green : styles.blue600}`}>{date}</span>
            <p className={styles.siteCardTitle}>{title}</p>
            <p className={styles.bodyS}>{body}</p>
          </li>
        ))}
      </ul>
    </Slide>
  )
}

function Results() {
  return (
    <Slide page="02">
      <div className={styles.split}>
        <div>
          <Eyebrow>01 — RESULTS</Eyebrow>
          <Headline n={14} w={623} h={233}>
            Live without a hiccup.
          </Headline>
          <p className={styles.bodyL}>Launched on day 23. The domain moved, the blog moved, and Google was told. The team’s verdict: “without a single hiccup.”</p>
        </div>
        <Img name="result_key" w={880} h={495} className={styles.glow} alt="The launched naxum.com" />
      </div>
      <ul className={styles.grid4}>
        {[
          ['23', 'days from proposal to production'],
          ['0', 'minutes of downtime', true],
          ['105', '301 redirects, every old page accounted for'],
          ['Filed', 'change of address in Search Console'],
        ].map(([value, label, green]) => (
          <li key={label}>
            <p className={`${styles.stat} ${green ? styles.green : ''}`}>{value}</p>
            <p className={`${styles.bodyXs} ${styles.muted}`}>{label}</p>
          </li>
        ))}
      </ul>
    </Slide>
  )
}

function Owned() {
  return (
    <Slide page="03">
      <Header eyebrow="02 — MY ROLE" headline={<Headline n={15} w={385} h={233}>What I owned.</Headline>}>
        I led it end to end, and the team made the launch possible.
      </Header>
      <div className={styles.grid2}>
        <div className={`${styles.nightCard} ${styles.ownedCard}`}>
          <span className={`${styles.mono} ${styles.blue400}`}>I OWNED</span>
          {['The proposal to leave WordPress', 'The brand style guide and design tokens', 'The design of every page, desktop and phone', 'The React build, the blog and the sales sites', 'The redirect map and the launch runbook'].map((line) => (
            <p key={line} className={styles.ownedLine}>
              <span aria-hidden="true">✓</span> {line}
            </p>
          ))}
        </div>
        <div className={`${styles.nightCard} ${styles.ownedCard}`}>
          <span className={`${styles.mono} ${styles.blue400}`}>WITH THE TEAM</span>
          {['Copy and content', 'Domains, hosting and the cutover', 'Review before launch', 'Sales forms and lead capture'].map((line) => (
            <p key={line} className={styles.ownedLine}>
              <span aria-hidden="true">·</span> {line}
            </p>
          ))}
          <p className={`${styles.bodyS} ${styles.blue200}`}>“Amazing artwork!” — NaXum leadership, on launch day</p>
        </div>
      </div>
    </Slide>
  )
}
