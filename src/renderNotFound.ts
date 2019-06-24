import { getIcestark } from './util/index';

export default () => {
  const getRenderFunction = getIcestark('handleNotFound');
  return getRenderFunction
    ? getRenderFunction()
    : 'Current sub-application is running independently';
};
