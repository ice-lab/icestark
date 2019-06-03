import { getIcestark } from './_util/index';

export default () => (getIcestark('basename') ? getIcestark('basename') : '/');
