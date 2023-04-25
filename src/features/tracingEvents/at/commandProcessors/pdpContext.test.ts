/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { initialState } from '..';
import { atPacket, convertPackets } from '../testUtils';

test('parse +CGDCONT', () => {
    let state = convertPackets([
        atPacket('AT+CGDCONT?'),
        atPacket('+CGDCONT: 0,"IP","internet","10.0.1.1",0,0\r\nOK\r\n'),
    ]);
    expect(state.accessPointNames).toEqual({
        internet: {
            cid: 0,
            pdnType: 'IP',
            apn: 'internet',
            ipv4: '10.0.1.1',
        },
    });

    state = convertPackets([
        atPacket('AT+CGDCONT?'),
        atPacket(
            '+CGDCONT: 0,"IP","internet","10.0.1.1",0,0\r\n+CGDCONT: 1,"IP","IOT_apn","10.0.1.2",0,0\r\nOK\r\n'
        ),
    ]);
    expect(state.accessPointNames).toEqual({
        internet: {
            cid: 0,
            pdnType: 'IP',
            apn: 'internet',
            ipv4: '10.0.1.1',
        },
        IOT_apn: {
            cid: 1,
            pdnType: 'IP',
            apn: 'IOT_apn',
            ipv4: '10.0.1.2',
        },
    });

    state = convertPackets(
        [
            atPacket('AT+CGDCONT?'),
            atPacket('+CGDCONT: 0,"IP","internet","10.0.1.1",0,0\r\nOK\r\n'),
        ],
        state
    );
    expect(state.accessPointNames).toEqual({
        internet: {
            cid: 0,
            pdnType: 'IP',
            apn: 'internet',
            ipv4: '10.0.1.1',
        },
    });

    // Test that we do not fully replace, but rather add information to an
    // already existing APN.
    state = convertPackets(
        [
            atPacket('AT+CGDCONT?'),
            atPacket('+CGDCONT: 0,"IP","internet","10.0.1.1",0,0\r\nOK\r\n'),
        ],
        {
            ...initialState(),
            accessPointNames: {
                internet: {
                    apn: 'internet',
                    ipv6: '1111:1111:1111:1111:0001:0001:0001:0001',
                },
            },
        }
    );

    expect(state.accessPointNames).toEqual({
        internet: {
            cid: 0,
            pdnType: 'IP',
            apn: 'internet',
            ipv4: '10.0.1.1',
            ipv6: '1111:1111:1111:1111:0001:0001:0001:0001',
        },
    });
});
