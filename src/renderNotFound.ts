import { getIcestark } from './constant';

export default () => {
  const getRenderFunction = getIcestark('handleNotFound');
  return getRenderFunction
    ? getRenderFunction()
    : 'Current sub-application is running independently';
};
