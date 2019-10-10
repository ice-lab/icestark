const appHistory = {
  push: (url: string) => {
    window.history.pushState(
      {
        forceRender: true,
      },
      null,
      url,
    );
  },
  replace: (url: string) => {
    window.history.replaceState(
      {
        forceRender: true,
      },
      null,
      url,
    );
  },
};

export default appHistory;
