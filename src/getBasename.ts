import { getIcestark } from './constant';

export default () => (getIcestark('basename') ? getIcestark('basename') : '/');
