module.exports = {
  title: 'ICESTARK',
  logo: {
    alt: 'icestark',
    src: 'img/logo.png',
  },
  items: [
    {
      type: 'search',
      position: 'right',
    },
    {
      to: '/docs/guide',
      position: 'right',
      label: '文档',
    },
    {
      to: '/docs/api/ice-stark',
      position: 'right',
      label: 'API',
    },
    {
      to: '/docs/faq',
      position: 'right',
      label: '常见问题',
    },
    // {
    //   position: 'right',
    //   label: 'Changelog',
    //   href: 'https://github.com/ice-lab/icestark/releases',
    // },
    // currently hide blog
    {
      label: '博客',
      to: 'blog',
      position: 'right',
    },
    {
      href: 'https://github.com/ice-lab/icestark',
      // label: 'GitHub',
      className: 'header-github-link',
      position: 'right',
    },
  ],
};
