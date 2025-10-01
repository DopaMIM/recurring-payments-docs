// @ts-check
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    // Main protocol docs
    'overview',
    'core-functions',
    'events',
    'networks',
    'best-practices',
    'glossary',

    // Automation Layer section
    {
      type: 'category',
      label: 'Automation Layer',
      collapsible: true,
      collapsed: false,
      items: [
        'automation-overview',
        'automation-core',
        'automation-events',
        'automation-networks',
        'automation-quickstart',
      ],
    },
  ],
};
export default sidebars;
