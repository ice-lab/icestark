import { getCache } from './cache';

const getLoadMode = (): string | undefined => getCache('loadMode');

export default getLoadMode;
