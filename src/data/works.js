import { naxum } from './showcases/naxum.js'

/*
  The books on the "My Works" shelf, in shelf order (the first nine are on the bookcase;
  phones show them all). Placeholders for now: titles from real work, case studies to come.
  `cover` picks a cover colour (drawn in code, src/room-art/sprites.js COVERS):
    navy, coral, sage, purple, teal, crimson, charcoal, mustard.
  `caseStudy` (heading, meta, hero, sections) replaces the placeholder window.
  `showcase` (src/data/showcases/) opens a full-screen viewer with a side nav instead of a window,
  for work with many parts.
  `preview` plays on the monitor while the book is hovered: a muted web MP4 in
  public/assets/previews/ (about 960px wide, no audio track) and a still `poster` shown while it loads.
*/
export const works = [
  {
    id: 'virtual-office',
    title: 'NaXum',
    subtitle: 'Design System',
    cover: 'navy',
    preview: { src: '/assets/previews/naxum.mp4', poster: '/assets/previews/naxum.webp' },
    showcase: naxum,
  },
  { id: 'blessup-site', title: 'BlessUP', subtitle: 'Brand & Web', cover: 'purple' },
  { id: 'board', title: 'Board', subtitle: 'Chat-first PM', cover: 'sage' },
  { id: 'ai-platform', title: 'AI Layer', subtitle: 'SaaS Product', cover: 'teal' },
  { id: 'naxum-site', title: 'NaXum.com', subtitle: 'Marketing Site', cover: 'coral' },
  { id: 'motion-films', title: 'Motion', subtitle: 'Launch Films', cover: 'charcoal' },
  { id: 'tutorials', title: 'Tutorials', subtitle: 'Video Series', cover: 'crimson' },
  { id: 'linkedin-visuals', title: 'Visuals', subtitle: 'LinkedIn Posts', cover: 'mustard' },
  { id: 'more-works', title: 'More Works', subtitle: 'Explore →', cover: 'charcoal' },
]
