import { getCache } from './cache';

const getInIcestark = () => !!getCache('root');

export default getInIcestark;
