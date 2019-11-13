export interface AppHistory {
  push(path: string): void;
  replace(path: string): void;
}

const appHistory: AppHistory = {
  push: (path: string) => {
    window.history.pushState(
      {
        forceRender: true,
      },
      null,
      path,
    );
  },
  replace: (path: string) => {
    window.history.replaceState(
      {
        forceRender: true,
      },
      null,
      path,
    );
  },
};

export default appHistory;
