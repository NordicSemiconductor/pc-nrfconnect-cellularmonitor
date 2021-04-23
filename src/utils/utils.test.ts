import { getNameAndDirectory } from './fileUtils';
import { truncateMiddle } from './index';

test('get name and directory', () => {
    expect(getNameAndDirectory('some/path/to/file.bin')).toStrictEqual([
        'file.bin',
        'some/path/to',
    ]);
});

test('truncate string', () => {
    expect(
        truncateMiddle('some long string with more than 20 characters')
    ).toBe('some long string wit... characters');
    expect(truncateMiddle('short string')).toBe('short string');
    expect(truncateMiddle('string with 20 chars')).toBe('string with 20 chars');
    expect(truncateMiddle('string with 23 chars 12')).toBe(
        'string with 23 chars 12'
    );
    expect(truncateMiddle('string with 24 chars 123')).toBe(
        'string with 24 chars...3'
    );
});
