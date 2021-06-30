/** @type {import('@docusaurus/types').DocusaurusConfig} */
const navbar = require('./config/navbar');
const footer = require('./config/footer');

module.exports = {
  title: 'icestark',
  tagline: '基于 React 的渐进式研发框架',
  url: 'https://micro-frontends.ice.work',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'ice-lab',
  projectName: 'icestark',
  themeConfig: {
    navbar,
    footer,
    // googleAnalytics: {
    //   trackingID: 'G-QZ0FEKY38G',
    // },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./config/sidebars.js'),
          editUrl:
            'https://github.com/ice-lab/icestark/tree/gh-pages',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: ["en", "zh"],
      },
    ]
  ]
};
