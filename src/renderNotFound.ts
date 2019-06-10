import { getIcestark } from './util/index';

export default (getIcestark('handleNotFound')
  ? getIcestark('handleNotFound')
  : () => 'Current sub-application is running independently');
