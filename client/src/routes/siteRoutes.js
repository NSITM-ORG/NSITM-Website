/**
 * Site Routes — public pages rendered inside SiteLayout.
 * `showInNav: true` marks entries that appear in the Header's nav links.
 */

export const siteRoutes = [
  {
    id: 'home', path: '/', page: 'HomePage', layout: 'SiteLayout', access: 'allow',
    showInNav: true, navLabel: 'Home',
    meta: { title: 'Home', description: 'Nextserve School of Information Technology and Management — hands-on, cohort-based tech and management training in Nigeria.' },
  },
  {
    id: 'about', path: '/about', page: 'AboutPage', layout: 'SiteLayout', access: 'allow',
    showInNav: true, navLabel: 'About',
    meta: { title: 'About Us', description: 'Our history, philosophy, and teaching approach.' },
  },
  {
    id: 'programmes', path: '/programmes', page: 'ProgrammesPage', layout: 'SiteLayout', access: 'allow',
    showInNav: true, navLabel: 'Programmes',
    meta: { title: 'Our Programmes', description: 'Explore 26 tech, management, and short-term programmes.' },
  },
  {
    id: 'programme-category', path: '/programmes/category/:category', page: 'ProgrammeCategoryPage',
    layout: 'SiteLayout', access: 'allow', meta: { title: 'Programme Category' },
  },
  {
    id: 'programme-detail', path: '/programmes/:slug', page: 'ProgrammeDetailPage',
    layout: 'SiteLayout', access: 'allow', meta: { title: 'Programme Details' },
  },
  {
    id: 'faq', path: '/faq', page: 'FaqPage', layout: 'SiteLayout', access: 'allow',
    showInNav: true, navLabel: 'FAQs',
    meta: { title: 'Frequently Asked Questions' },
  },
];

export default siteRoutes;