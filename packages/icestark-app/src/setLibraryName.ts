import { setCache } from './cache';

const setLibraryName = (library: string) => {
  if (library === undefined || library === null) {
    console.warn('[@ice/stark-app] setLibraryName: params can not be undefined or null!');
    return;
  };
  setCache('library', library);
};

export default setLibraryName;
