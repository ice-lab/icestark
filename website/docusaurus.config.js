/** @type {import('@docusaurus/types').DocusaurusConfig} */
const navbar = require('./config/navbar');
const footer = require('./config/footer');

module.exports = {
  title: 'icestark',
  tagline: '面向大型系统的微前端解决方案',
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
    gtag: {
      trackingID: 'G-BYD48PYEE0',
    },
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
    ],
  ],
};
