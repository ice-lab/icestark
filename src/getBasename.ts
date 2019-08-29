import { getCache } from './cache';

export default (): string => (getCache('basename') ? getCache('basename') : '/');
