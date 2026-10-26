import MotionCaseStudy from '../../components/showcase/MotionCaseStudy.jsx'
import NaxumSiteCaseStudy from '../../components/showcase/NaxumSiteCaseStudy.jsx'
import VirtualOfficeCaseStudy from '../../components/showcase/VirtualOfficeCaseStudy.jsx'
import AiCaseStudy from '../../components/showcase/AiCaseStudy.jsx'

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
        {
          id: 'wordpress-to-react',
          title: 'How I took a corporate site from WordPress to React in 23 days without losing its rankings',
          Content: NaxumSiteCaseStudy,
        },
        {
          id: 'virtual-office',
          title: 'How I rebuilt the back office: one template for 35+ brands',
          Content: VirtualOfficeCaseStudy,
        },
        {
          id: 'ai-v1',
          title: 'How I took our first AI feature from a one-page vision to its first client in 15 weeks',
          Content: AiCaseStudy,
        },
      ],
    },
  ],
}
