/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AvailablePlmn } from '../../types';
import { atPacket, convertPackets, OkPacket } from '../testUtils';

test('Set +COPS with OK response should set the state', () => {
    let state = convertPackets([atPacket('AT+COPS=0'), OkPacket]);
    expect(state.plmnMode).toBe(0);

    state = convertPackets([atPacket('AT+COPS=1,2,"24407"'), OkPacket]);
    expect(state.plmnMode).toBe(1);
    expect(state.plmnFormat).toBe(2);
    expect(state.plmn).toBe('24407');

    state = convertPackets([atPacket('AT+COPS=0'), OkPacket], state);
    // Unsure if this is what we want to expect
    expect(state.plmnMode).toBe(0);
    expect(state.plmnFormat).toBe(2);
    expect(state.plmn).toBe('24407');
});

test('Read +COPS should set the state', () => {
    let state = convertPackets([
        atPacket('AT+COPS?'),
        atPacket('+COPS: 0,2,"24407"\r\nOK\r\n'),
    ]);
    expect(state.plmnMode).toBe(0);
    expect(state.plmnFormat).toBe(2);
    expect(state.plmn).toBe('24407');
    expect(state.AcTState).toBeUndefined();

    state = convertPackets(
        [atPacket('AT+COPS?'), atPacket('+COPS: 0,2,"26201",7\r\nOK\r\n')],
        state
    );
    expect(state.plmnMode).toBe(0);
    expect(state.plmnFormat).toBe(2);
    expect(state.plmn).toBe('26201');
    expect(state.AcTState).toBe(7);

    state = convertPackets(
        [atPacket('AT+COPS?'), atPacket('+COPS: 0,0,"RADIOLINJA",7\r\nOK\r\n')],
        state
    );
    expect(state.plmnMode).toBe(0);
    expect(state.plmnFormat).toBe(0);
    expect(state.plmn).toBe('RADIOLINJA');
    expect(state.AcTState).toBe(7);
});

test('Test +COPS sets available PLMNs according to the response', () => {
    let state = convertPackets([
        atPacket('AT+COPS=?'),
        atPacket('+COPS: \r\nOK\r\n'),
    ]);
    expect(state.availablePlmns).toEqual([]);

    state = convertPackets([
        atPacket('AT+COPS=?'),
        atPacket('+COPS: (2,"","","26201",7),(1,"","","26202",7)\r\nOK\r\n'),
    ]);
    expect(state.availablePlmns).toEqual([
        {
            stat: 2,
            longOperatorName: '',
            shortOperatorName: '',
            operatorNumeric: '26201',
            AcTState: 7,
        },
        {
            stat: 1,
            longOperatorName: '',
            shortOperatorName: '',
            operatorNumeric: '26202',
            AcTState: 7,
        },
    ] as AvailablePlmn[]);

    state = convertPackets([
        atPacket('AT+COPS=?'),
        atPacket('+COPS: (2,"","","26201",7)\r\nOK\r\n'),
    ]);
    expect(state.availablePlmns).toEqual([
        {
            stat: 2,
            longOperatorName: '',
            shortOperatorName: '',
            operatorNumeric: '26201',
            AcTState: 7,
        },
    ]);
});
