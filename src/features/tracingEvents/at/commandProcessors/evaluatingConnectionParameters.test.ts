/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import { State } from '../../types';
import { atPacket, convertPackets } from '../testUtils';

const setCommands = {
    commands: [
        atPacket('AT%CONEVAL'),
        atPacket(
            '%CONEVAL: 0,1,5,8,2,14,"011B0780”,"26295",7,1575,3,1,1,23,16,32,130\r\nOK\r\n'
        ),
    ],
    expected: {
        conevalResult: 0,
        rrcState: 1,
        conevalEnergyEstimate: 5,
        signalQuality: {
            rsrp: 8,
            rsrq: 2,
            snr: 14,
        },
        cellID: '011B0780',
        plmn: '26295',
        physicalCellID: 7,
        earfcn: 1575,
        band: 3,
        TAUTriggered: 1,
        conevalCoverageEnhancementLevel: 1,
        conevalTXPower: 23,
        conevalTXRepetitions: 16,
        conevalRXRepetitions: 32,
        conevalDLPathLoss: 130,
    } as Partial<State>,
};

test('AT%CONEVAL gives appropriate partial state after evaluation response.', () => {
    const result = convertPackets(setCommands.commands);

    Object.entries(setCommands.expected).forEach(([key, value]) => {
        const actual = result[key as keyof State];
        if (typeof actual === 'object') {
            expect(actual).toEqual(value);
        } else {
            expect(actual).toBe(value);
        }
    });
    // expect(result).toEqual(setCommands.expected);
});
