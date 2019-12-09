import { getCache } from './cache';

const isInIcestark = () => !!getCache('root');

export default isInIcestark;
