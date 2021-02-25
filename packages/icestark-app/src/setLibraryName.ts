import { setCache } from './cache';

const setLibraryName = (library: string): void => {
  if (!library) {
    console.error('[@ice/stark-app] setLibraryName: params can not be empty!');
    return;
  };
  setCache('library', library);
};

export default setLibraryName;
