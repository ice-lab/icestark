export default {
  mode: 'site',
  locales: [['zh-CN', '中文']],
  title: 'icestark',
  logo: ' ',
  favicon:
    '/assets/favicon.png',
  styles: [
    '.__dumi-default-navbar-logo:not([data-plaintext]){padding-left: 0 !important}',
    '.markdown{ padding-bottom: 200px }',
    'code[class*="language-"], pre[class*="language-"]{ color: #333 }',
    '.markdown :not(pre) code { font-size: 14px }',
    '.markdown pre { font-size: 13px }',
    'a:hover { color: #F6AF1F !important }',
    '.__dumi-default-layout-content a { color: #F6AF1F !important }',
    'a.active { color: #F6AF1F !important }',
    'ul li > span::before { background-color: #F6AF1F !important }',
    'ul li a::before, nav > span > a.active::after { opacity: 0 !important; background-color: #F6AF1F !important }',
    '.__dumi-default-layout-content{ max-width: none !important }',
    '.__dumi-default-layout[data-route="/"] .markdown{ padding-bottom: 0px !important;padding-left: 0px !important; padding-right: 0px !important }',
    '.__dumi-default-layout-features{ max-width: none !important }',
    '.__dumi-default-menu-list > li > a::after{ background-color: #F6AF1F !important }',
    '::-webkit-scrollbar{ display:none }',
    '.__dumi-default-layout-footer-meta { display: none !important }',
    '.__dumi-default-layout-hero{ display: none !important }',
    '.__dumi-default-layout { padding-left: 0px !important;padding-right: 0px !important; padding-bottom: 0px !important }',
    '.footer-container a { color: #FFFFFF !important }',
    '.__dumi-default-layout[data-route="/"] .__dumi-default-layout-footer { display: none }',
    '.__dumi-default-navbar-logo{ width: 100px }',
    '.__dumi-default-layout-features > dl dt { margin-bottom: 8px !important }',
    '.userItem{ display: inline-block; margin: 30px 50px 0 0 } .userItemImg{ max-width: 200px; max-height: 33px; vertial-align: middle}',
    '.features{ display: flex; justify-content: space-around; padding: 50px 0 !important} .features-item { display: inline-block; max-width: 300px; text-align: center }',
    '@media only screen and (min-width: 767px) {\
      .__dumi-default-menu { width: 350px !important }\
      .markdown{ padding-left: 380px !important }\
      .homepage-title { color: #0b1b3e;font-size: 50px;line-height: 71px;margin: 0;padding-bottom: 28px;font-weight: 600;box-sizing: content-box;box-sizing: initial;position: relative;font-family: PingFangSC-Semibold;letter-spacing: 0 }\
      .homepage-subtitle { font-weight: 100;font-size: 18px;margin-bottom: 10px;font-family: PingFangSC-Light;color: #000;line-height: 1.8em;}\
      .homepage-img { width: 50%;position: absolute;right: 0;z-index: 1 } \
      .quick-start-github{ line-height: 42px; }\
      .quick-start{ margin-top: 50px; display: flex;flex-direction:row; }\
      .homepage-root{ max-width: 1180px;width: 100%;margin: 0 auto;position: relative;height:450px }\
      .introduction-infos{ width:50%; padding:120px 25px }\
      .footer-block-content{ flex-grow: 1; }\
      .footer-wrapper{ max-width: 1180px;margin: 0 auto;padding: 100px 0 0px;display: flex;flex-wrap: wrap; }\
      .markdown{ padding-right: 200px },\
    }',
    '@media only screen and (max-width: 767px) {\
      .homepage-title { text-align: center; color: #0b1b3e;font-size: 38px;line-height: 71px;;margin: 0;padding-bottom: 28px;font-weight: 600;box-sizing: content-box;box-sizing: initial;position: relative;font-family: PingFangSC-Semibold;letter-spacing: 0 }\
      .homepage-subtitle { padding:0 16px;text-align: center, font-weight: 100;font-size: 18px;margin-bottom: 10px;font-family: PingFangSC-Light;color: #000;line-height: 1.8em;  }\
      .homepage-img { display: none }\
      .quick-start{ margin-top: 50px; display: flex;flex-direction:column; }\
      .quick-start-btn{ display: block; margin: 0 auto; }\
      iframe.quick-start-btn{ display: none; }\
      .quick-start-github{ text-align: center;margin-top: 20px;margin-left: 0; position: relative;top: 10px; }\
      .__dumi-default-layout[data-route="/"]{ padding-left: 0 !important; padding-right: 0 !important }\
      .homepage-root{ max-width: 1180px;width: 100%;margin: 0 auto;position: relative;height:450px }\
      .__dumi-default-layout-features dl { padding-left: 80px !important;width: 170px;margin: 30px auto !important; display: table; }\
      .introduction-img{ display: none !important; }\
      .introduction-infos{ width:100%; padding:120px 25px }\
      .footer-container div ul li { width: 100% !important }\
      .footer-block-content{ margin: 0 auto; flex-grow: 1; text-align: center }\
      .footer-wrapper{ max-width: 1180px;margin: 0 auto;padding: 100px 0 0px;display: flex;flex-wrap: wrap; flex-direction: column; }\
    }',
  ],
  scripts: [
    // 数据统计
    {
      src: 'https://s9.cnzz.com/z_stat.php?id=1279786237&web_id=1279786237',
      defer: true,
    }
  ],
  navs: [
    {
      title: '文档',
      path: '/guide',
    },
    {
      title: 'API',
      path: '/api',
    },
    {
      title: '常见问题',
      path: '/faq',
    },
    {
      title: 'Changelog',
      path: 'https://github.com/ice-lab/icestark/releases'
    },
    {
      title: 'GitHub',
      path: 'https://github.com/ice-lab/icestark',
    },
  ],
  menus: {
    '/guide': [
      {
        title: '快速起步',
        path: '/guide',
      },
      {
        title: '升级指南',
        path: '/guide/upgrade'
      },
      {
        title: '概念',
        path: '/guide/concept',
        children: [
          {
            title: '生命周期',
            path: '/guide/concept/lifecycle'
          },
          {
            title: '微应用入口',
            path: '/guide/concept/entry'
          }
        ]
      },
      {
        title: '使用',
        path: '/guide/use',
        children: [
          {
            title: '微应用打包',
            path: '/guide/use/bundler'
          },
          {
            title: '使用 API 接入',
            path: '/guide/use/api'
          },
          {
            title: '使用 React Component 接入',
            path: '/guide/use/wrapper'
          }
        ],
      },
      {
        title: '进阶',
        path: '/guide/advanced',
        children: [
          {
            title: '应用间通信',
            path: '/guide/advanced/communication',
          },
          {
            title: '样式和脚本隔离',
            path: '/guide/advanced/sandbox',
          },
          {
            title: '性能优化',
            path: '/guide/advanced/performance',
          }
        ],
      },
      {
        title: '接入指南',
        path: '/guide/access',
        children: [
          {
            title: 'CRA 应用',
            path: '/guide/access/cra'
          },
          {
            title: 'Umi 应用',
            path: '/guide/access/umi'
          }
        ]
      },
      {
        title: '贡献代码',
        path: '/guide/contribute'
      },
    ],
    '/api': [
      {
        title: 'core',
        path: '/api/core',
      },
      {
        title: 'wrapper',
        path: '/api/wrapper',
      },
      {
        title: 'utils',
        path: '/api/utils',
      }
    ]
  },
};