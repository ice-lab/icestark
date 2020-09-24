import '@testing-library/jest-dom/extend-expect';

import { converArray2String } from '../src/AppRouter';

describe('converArray2String', () => {
  test('converArray2String', () => {
    expect(converArray2String(['this', 'is', 'a', 'test'])).toBe('this,is,a,test');
    expect(converArray2String('this is a test')).toBe('this is a test');
    expect(converArray2String(1 as any)).toBe('1');
  });
});
