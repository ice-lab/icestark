import { setCache } from './cache';

function setBasename(base: string) {
  return setCache('basename', base);
}

export default setBasename;
