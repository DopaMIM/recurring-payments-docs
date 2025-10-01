// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Blockhead Recurring Payments Protocol',
  tagline: 'Recurring payments made simple',
  favicon: 'img/favicon.ico',

  // Custom domain
  url: 'https://developers.blockhead.finance',
  baseUrl: '/',                     // root path on the custom domain

  // These can stay; they’re mostly used for edit URLs and metadata
  organizationName: 'your-org',
  projectName: 'your-repo',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',        // docs as homepage
        },
        blog: false,                 // no blog
        theme: { customCss: './src/css/custom.css' },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Blockhead',
      logo: { alt: 'Blockhead Logo', src: 'img/logo.svg' },
      items: [
        { type: 'doc', docId: 'overview', position: 'left', label: 'Docs' },
        { href: 'https://github.com/your-org/your-repo', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        { title: 'Docs', items: [{ label: 'Overview', to: '/' }] },
        { title: 'Community', items: [{ label: 'GitHub', href: 'https://github.com/your-org/your-repo' }] },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Blockhead. Built with Docusaurus.`,
    },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
  },
};

export default config;
