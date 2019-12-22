export interface AppHistory {
  push(path: string): void;
  replace(path: string): void;
}

const appHistory: AppHistory = {
  push: (path: string) => {
    window.history.pushState({}, null, path);
  },
  replace: (path: string) => {
    window.history.replaceState({}, null, path);
  },
};

export default appHistory;
