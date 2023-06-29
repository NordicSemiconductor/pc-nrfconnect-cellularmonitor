/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { State } from '../../types';
import { atPacket, convertPackets } from '../testUtils';

test('%XMONTIOR rsrp and snr 255 yield undefined decibel', () => {
    const state = convertPackets([
        atPacket(
            '%XMONITOR: 5,"Telia N@","Telia N@","24202","0901",7,20,"02024720",428,6300,255,255,"","00000010","00100010","01001001"\r\nOK'
        ),
    ]);
    expect(state.signalQuality?.rsrp).toBe(255);
    expect(state.signalQuality?.rsrp_decibel).toBeUndefined();
    expect(state.signalQuality?.snr).toBe(255);
    expect(state.signalQuality?.snr_decibel).toBeUndefined();
});

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

test('%XMONITOR Power Saving Mode specifics', () => {
    const expectedGranted = {
        T3324: {
            bitmask: '00000001',
        },
        T3412Extended: {
            bitmask: '11000001',
        },
        T3412: {
            bitmask: '01011111',
        },
    };

    const state = convertPackets([
        atPacket('AT%XMONITOR'),
        atPacket(
            '1,"","","24201","8169",7,20,"014ACE00",,,,,"","00000001","11000001","01011111"\r\nOK\r\n'
        ),
    ]);

    expect(state.powerSavingMode?.granted?.T3324?.bitmask).toEqual(
        expectedGranted.T3324.bitmask
    );
    expect(state.powerSavingMode?.granted?.T3412Extended?.bitmask).toEqual(
        expectedGranted.T3412Extended.bitmask
    );
    expect(state.powerSavingMode?.granted?.T3412?.bitmask).toEqual(
        expectedGranted.T3412.bitmask
    );
});

// Format of mfw version >= v1.2.x
const modernModemVersionPacket = {
    command: atPacket('AT%XMONITOR'),
    response: atPacket(
        '%XMONITOR: 5,"Telia N@","Telia N@","24202","0901",7,20,"02024720",428,6300,53,22,"","00000010","00100010","01001001"\r\nOK'
    ),
    expected: {
        networkStatus: 5,
        operatorFullName: 'Telia N@',
        operatorShortName: 'Telia N@',
        plmn: '24202',
        tac: '0901',
        AcTState: 7,
        band: 20,
        cellID: '02024720',
        phys_cell_id: 428,
        earfcn: 6300,

        powerSavingMode: {
            granted: {
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
        networkStatus: 5,
        operatorFullName: 'Telia N@',
        operatorShortName: 'Telia N@',
        plmn: '24202',
        tac: '0901',
        AcTState: 7,
        band: 20,
        cellID: '02024720',
        phys_cell_id: 428,
        earfcn: 6300,

        powerSavingMode: {
            granted: {
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
