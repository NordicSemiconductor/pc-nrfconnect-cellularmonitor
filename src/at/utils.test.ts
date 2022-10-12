import { getNumberList, getParametersFromResponse } from './utils';

test('getNumberList', () => {
    expect(getNumberList('1,2,3,4')).toEqual([1, 2, 3, 4]);
    expect(getNumberList('1,"2",3,4')).toEqual([1, NaN, 3, 4]);
    expect(getNumberList('\n1,2,3')).toEqual([]);
});

test('getParametersFromResponse', () => {
    const body =
        ': 5,"Telia N@","Telia N@","24202","0901",7,20,"02024720",428,6300,53,22,"","11100000","11100000","01001001"\r\nOK\r\n';
    const body2 =
        ': 5,\\"Telia N@\\",\\"Telia N@\\",\\"24202\\",\\"0901\\",7,20,\\"02024720\\",428,6300,53,22,\\"\\",\\"11100000\\",\\"11100000\\",\\"01001001\\"\\r\\nOK';
    const expected = [
        5,
        'Telia N@',
        'Telia N@',
        '24202',
        '0901',
        7,
        20,
        '02024720',
        428,
        6300,
        53,
        22,
        '',
        '11100000',
        '11100000',
        '01001001',
    ];
    expect(getParametersFromResponse(body)).toEqual(expected);
    expect(getParametersFromResponse(body2)).toEqual(expected);
});
