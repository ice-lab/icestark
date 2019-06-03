import { getIcestark } from './_util/index';

export default (getIcestark('handleNotFound')
  ? getIcestark('handleNotFound')
  : () => 'Current sub-application is running independently');
