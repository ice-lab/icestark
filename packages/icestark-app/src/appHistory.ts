import formatUrl from './util/formatUrl';

const appHistory = {
  push: (url: string, hashType?: boolean, state?: object) => {
    window.history.pushState(
      state ?? {},
      null,
      formatUrl(url, hashType),
    );
  },
  replace: (url: string, hashType?: boolean, state?: object) => {
    window.history.replaceState(
      state ?? {},
      null,
      formatUrl(url, hashType),
    );
  },
};

export default appHistory;
