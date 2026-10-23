import MotionCaseStudy from '../../components/showcase/MotionCaseStudy.jsx'

/*
  The NaXum showcase: opened from the NaXum book as a full-screen viewer with a side nav
  (src/components/Showcase.jsx). Pages are added here as Mide provides them.

  Each group is a heading in the side nav; each item is one page: either its own designed
  `Content` component, or title, kicker (a short line above the title), summary (a paragraph),
  stats (big numbers), points (bullet list), media (optional { video, poster } or { src, alt }).
*/

export const naxum = {
  title: 'NaXum',
  subtitle: '',
  groups: [
    {
      label: 'Overview',
      items: [
        {
          id: 'motion-design-system',
          title: 'How I used Claude to create a motion design system for marketing',
          Content: MotionCaseStudy,
        },
      ],
    },
  ],
}
