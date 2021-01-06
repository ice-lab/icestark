import { getCache } from './cache';

export default (): string => (getCache('loadMode') ? getCache('loadMode') : null);
