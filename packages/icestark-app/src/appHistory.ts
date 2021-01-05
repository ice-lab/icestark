import formatUrl from './util/formatUrl';

const appHistory = {
  push: (url: string, hashType?: boolean) => {
    window.history.pushState(
      {},
      null,
      formatUrl(url, hashType)
    );
  },
  replace: (url: string, hashType?: boolean) => {
    window.history.replaceState(
      {},
      null,
      formatUrl(url, hashType)
    );
  },
};

export default appHistory;
