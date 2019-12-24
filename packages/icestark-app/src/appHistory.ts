const appHistory = {
  push: (url: string) => {
    window.history.pushState({}, null, url);
  },
  replace: (url: string) => {
    window.history.replaceState({}, null, url);
  },
};

export default appHistory;
