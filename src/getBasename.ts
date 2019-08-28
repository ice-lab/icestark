import { getIcestark } from './common';

export default () => (getIcestark('basename') ? getIcestark('basename') : '/');
