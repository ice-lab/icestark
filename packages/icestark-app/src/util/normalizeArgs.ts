// `hashType' was relocated to the third argument.
const isDev = process.env.NODE_ENV === 'development';

const normalizeArgs = (state?: object | boolean, hashType?: boolean): [object, boolean] => {
  if (typeof state === 'boolean') {
    isDev && console.warn('[icestark]: hashType was relocated to the third argument.');
    return [{}, hashType ?? state];
  }
  if (typeof state === 'object') {
    return [state, hashType];
  }

  return [{}, hashType];
};

export default normalizeArgs;
