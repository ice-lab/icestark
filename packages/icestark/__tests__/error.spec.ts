import '@testing-library/jest-dom/extend-expect';
import { formatErrMessage } from '../src/util/error';

describe('helpers', () => {
  test('formatErrMessage', () => {
    expect(
      formatErrMessage(0)
    ).toEqual('icestark minified message #0: See https://micro-frontends.ice.work/error?code=0');

    expect(
      formatErrMessage(0, 'Unable to load app')
    ).toEqual('icestark minified message #0: Unable to load app. See https://micro-frontends.ice.work/error?code=0');

    expect(
      formatErrMessage(0, 'Unable to load app {0}')
    ).toEqual('icestark minified message #0: Unable to load app {0}. See https://micro-frontends.ice.work/error?code=0');

    expect(
      formatErrMessage(0, 'Unable to load app {0}', 'seller')
    ).toEqual('icestark minified message #0: Unable to load app seller. See https://micro-frontends.ice.work/error?code=0&arg=seller');
  });
})
