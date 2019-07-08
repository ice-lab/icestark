import { getIcestark } from './util/index';

export default () => (getIcestark('basename') ? getIcestark('basename') : '/');
