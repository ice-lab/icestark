import { getCache } from './cache';

export default () => (getCache('basename') ? getCache('basename') : '/');
