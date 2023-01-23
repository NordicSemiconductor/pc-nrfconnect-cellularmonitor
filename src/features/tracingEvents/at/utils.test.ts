/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getParametersFromResponse } from './utils';

test('getParametersFromResponse', () => {
    const shortBody = '"11100000","11100000","01001001"';
    const body =
        '"Telia N@","Telia N@","24202","0901",7,20,"02024720",428,6300,53,22,"","11100000","11100000","01001001"';
    const body2 =
        '\\"Telia N@\\",\\"Telia N@\\",\\"24202\\",\\"0901\\",7,20,\\"02024720\\",428,6300,53,22,\\"\\",\\"11100000\\",\\"11100000\\",\\"01001001\\"';

    const body3 =
        '0,1,5,8,2,14,\\"011B0780”,\\"26295\\",7,1575,3,1,1,23,16,32,130';
    const expected = [
        'Telia N@',
        'Telia N@',
        '24202',
        '0901',
        '7',
        '20',
        '02024720',
        '428',
        '6300',
        '53',
        '22',
        '',
        '11100000',
        '11100000',
        '01001001',
    ];
    const expectedBody3 = [
        '0',
        '1',
        '5',
        '8',
        '2',
        '14',
        '011B0780',
        '26295',
        '7',
        '1575',
        '3',
        '1',
        '1',
        '23',
        '16',
        '32',
        '130',
    ];
    expect(getParametersFromResponse(shortBody)).toEqual(expected.slice(-3));
    expect(getParametersFromResponse(body)).toEqual(expected);
    expect(getParametersFromResponse(body2)).toEqual(expected);

    expect(getParametersFromResponse(body3)).toEqual(expectedBody3);
});
