// Menu configuration
// headerMenuConfig：Head navigation configuration
// asideMenuConfig：Side navigation configuration

const headerMenuConfig = [
  {
    name: '反馈',
    path: 'https://github.com/alibaba/ice',
    external: true,
    newWindow: true,
    icon: 'email'
  },
  {
    name: '帮助',
    path: 'https://alibaba.github.io/ice',
    external: true,
    newWindow: true,
    icon: 'help'
  }
];

const asideMenuConfig = [
  {
    name: 'Home（A 仓库）',
    key: 'A',
    path: '/',
    icon: 'atm'
  },
  {
    name: 'UserHome（B 仓库）',
    key: 'B',
    path: '/user/home',
    icon: 'picture'
  }
];

export { headerMenuConfig, asideMenuConfig };
