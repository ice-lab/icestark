import { cssStorage } from '../src/storage/css';

describe('css storage', () => {
    test('filter logic', () => {
        cssStorage.count(['a', 'b']);
        expect(cssStorage.isPendingHold('a')).toEqual(true);
        expect(cssStorage.isPendingHold('c')).toEqual(false);
        cssStorage.pending2Loaded('a');
        cssStorage.pending2Loaded('b');
        expect(cssStorage.isPendingHold('a')).toEqual(false);
        expect(cssStorage.isLoadedHold('b')).toEqual(true);
        cssStorage.decount(['a', 'b']);
        expect(cssStorage.isLoadedHold('a')).toEqual(false);
        expect(cssStorage.isLoadedHold('b')).toEqual(false);
    });
})