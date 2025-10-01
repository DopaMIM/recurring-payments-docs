// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Blockhead Recurring Payments Protocol',
  tagline: 'Recurring payments made simple',
  favicon: 'img/favicon.ico',

  // Custom domain
  url: 'https://developers.blockhead.finance',
  baseUrl: '/', // root path on the custom domain

  // Repo metadata
  organizationName: 'DopaMIM',
  projectName: 'recurring-payments-docs',

  onBrokenLinks: 'throw',
  // v4-compatible location for the markdown broken-links hook
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/', // docs are the homepage
        },
        blog: false, // no blog
        theme: { customCss: require.resolve('./src/css/custom.css') },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Blockhead',
      logo: { alt: 'Blockhead Logo', src: 'img/logo.svg' },
      items: [
        { type: 'doc', docId: 'overview', position: 'left', label: 'Docs' },
        { href: 'https://github.com/DopaMIM/recurring-payments-docs', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            // 👇 point directly to your overview doc route (not '/')
            { label: 'Overview', to: '/overview' },
            { label: 'Core Functions', to: '/core-functions' },
            { label: 'Events', to: '/events' },
            { label: 'Networks', to: '/networks' },
            { label: 'Best Practices', to: '/best-practices' },
            { label: 'Glossary', to: '/glossary' },
          ],
        },
        {
          title: 'Community',
          items: [{ label: 'GitHub', href: 'https://github.com/DopaMIM/recurring-payments-docs' }],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Blockhead. Built with Docusaurus.`,
    },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
  },
};

export default config;
