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
    expect(getParametersFromResponse(shortBody)).toEqual(expected.slice(-3));
    expect(getParametersFromResponse(body)).toEqual(expected);
    expect(getParametersFromResponse(body2)).toEqual(expected);
});
