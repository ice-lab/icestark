import formatUrl from './util/formatUrl';
import normalizeArgs from './util/normalizeArgs';

const appHistory = {
  push: (url: string, state?: object | boolean, hashType?: boolean) => {
    const [_state, _hashType] = normalizeArgs(state, hashType);
    window.history.pushState(
      _state ?? {},
      null,
      formatUrl(url, _hashType),
    );
  },
  replace: (url: string, state?: object | boolean, hashType?: boolean) => {
    const [_state, _hashType] = normalizeArgs(state, hashType);
    window.history.replaceState(
      state ?? {},
      null,
      formatUrl(url, hashType),
    );
  },
};

export default appHistory;
