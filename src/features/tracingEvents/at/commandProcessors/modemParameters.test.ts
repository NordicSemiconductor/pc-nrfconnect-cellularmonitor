/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { State } from '../../types';
import { atPacket, convertPackets } from '../testUtils';

test('%XMONITOR packet with mfw version >= v1.2.x', () => {
    const state = convertPackets([
        modernModemVersionPacket.command,
        modernModemVersionPacket.response,
    ]);

    Object.entries(modernModemVersionPacket.expected).forEach(
        ([key, value]) => {
            if (key === 'powerSavingMode') {
                expect(state.powerSavingMode?.granted).toEqual(
                    modernModemVersionPacket.expected.powerSavingMode.granted
                );
            } else {
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                expect(state[key as any as keyof State]).toBe(value);
            }
        }
    );
});

test('%XMONITOR packet with mfw v1.0.x - v1.1.x', () => {
    const state = convertPackets([
        legacyModemVersionPacket.command,
        legacyModemVersionPacket.response,
    ]);

    Object.entries(legacyModemVersionPacket.expected).forEach(
        ([key, value]) => {
            if (key === 'powerSavingMode') {
                expect(state.powerSavingMode?.granted).toEqual(
                    legacyModemVersionPacket.expected.powerSavingMode.granted
                );
            } else {
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                expect(state[key as any as keyof State]).toBe(value);
            }
        }
    );
});

// Format of mfw version >= v1.2.x
const modernModemVersionPacket = {
    command: atPacket('AT%XMONITOR'),
    response: atPacket(
        '%XMONITOR: 5,"Telia N@","Telia N@","24202","0901",7,20,"02024720",428,6300,53,22,"","00000010","00100010","01001001"\r\nOK'
    ),
    expected: {
        regStatus: 5,
        operatorFullName: 'Telia N@',
        operatorShortName: 'Telia N@',
        plmn: '24202',
        tac: '0901',
        AcTState: 7,
        band: 20,
        cell_id: '02024720',
        phys_cell_id: 428,
        earfcn: 6300,
        NW_provided_eDRX_value: '',

        powerSavingMode: {
            granted: {
                state: 'on',
                T3324: {
                    activated: true,
                    bitmask: '00000010',
                    value: 4,
                    unit: 'seconds',
                },
                T3412Extended: {
                    activated: true,
                    bitmask: '00100010',
                    value: 7200,
                    unit: 'seconds',
                },
                T3412: {
                    activated: true,
                    bitmask: '01001001',
                    value: 324000,
                    unit: 'seconds',
                },
            },
        },
    },
};

// Format of mfw version v1.0.x - v1.1.x
const legacyModemVersionPacket = {
    command: atPacket('AT%XMONITOR'),
    response: atPacket(
        '%XMONITOR: 5,"Telia N@","Telia N@","24202","0901",7,20,"02024720",428,6300,53,22,"","00000010","01001001"\r\nOK'
    ),
    expected: {
        regStatus: 5,
        operatorFullName: 'Telia N@',
        operatorShortName: 'Telia N@',
        plmn: '24202',
        tac: '0901',
        AcTState: 7,
        band: 20,
        cell_id: '02024720',
        phys_cell_id: 428,
        earfcn: 6300,
        NW_provided_eDRX_value: '',

        powerSavingMode: {
            granted: {
                state: 'on',
                T3324: {
                    activated: true,
                    bitmask: '00000010',
                    value: 4,
                    unit: 'seconds',
                },
                T3412: {
                    activated: true,
                    bitmask: '01001001',
                    value: 324000,
                    unit: 'seconds',
                },
            },
        },
    },
};
