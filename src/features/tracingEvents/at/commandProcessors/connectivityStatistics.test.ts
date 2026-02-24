/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, OkPacket } from '../testUtils';
import {setGlobalLineModeDelimiter} from "../detectLineEnding";
import {parseAT} from "../parseAT";

test('Connectivity Statistics %XCONNSTAT can start and stop', () => {
    let state = convertPackets([atPacket('AT%XCONNSTAT=1'), OkPacket]);
    expect(state.connStat?.collecting).toBe(true);

    state = convertPackets([atPacket('AT%XCONNSTAT=0'), OkPacket], state);
    expect(state.connStat?.collecting).toBe(false);

    state = convertPackets([atPacket('AT%XCONNSTAT=0'), OkPacket], state);
    expect(state.connStat?.collecting).toBe(false);

    state = convertPackets([atPacket('AT%XCONNSTAT=1'), OkPacket], state);
    expect(state.connStat?.collecting).toBe(true);
});

test('Connectivity Statistics %XCONNSTAT report is written to state, and may be restarted without overwriting state', () => {
    const expectedConnStat = {
        collecting: true,
        smsTX: 2,
        smsRX: 3,
        dataTX: 45,
        dataRX: 60,
        packetMax: 708,
        packetAverage: 650,
    };
    let state = convertPackets([
        atPacket('AT%XCONNSTAT=1'),
        OkPacket,
        atPacket('AT%XCONNSTAT?'),
        atPacket('%XCONNSTAT=2,3,45,60,708,650\r\nOK\r\n'),
    ]);

    expect(state.connStat).toEqual(expectedConnStat);

    // Make sure that the state is not reset when connStat: { collecting: ... }, is "mutated".
    state = convertPackets([atPacket('AT%XCONNSTAT=0'), OkPacket], state);
    expect(state.connStat?.collecting).toBe(false);
    state = convertPackets([atPacket('AT%XCONNSTAT=1'), OkPacket], state);
    expect(state.connStat?.collecting).toBe(true);

    expect(state.connStat).toEqual(expectedConnStat);
});

describe('parseAT with LF delimiter', () => {
    beforeAll(() => {
        setGlobalLineModeDelimiter('\n');
    });

    test('Connectivity Statistics %XCONNSTAT report is written to state, and may be restarted without overwriting state', () => {
        const expectedConnStat = {
            collecting: true,
            smsTX: 2,
            smsRX: 3,
            dataTX: 45,
            dataRX: 60,
            packetMax: 708,
            packetAverage: 650,
        };
        let state = convertPackets([
            atPacket('AT%XCONNSTAT=1'),
            OkPacket,
            atPacket('AT%XCONNSTAT?'),
            atPacket('%XCONNSTAT=2,3,45,60,708,650\nOK\n'),
        ]);

        expect(state.connStat).toEqual(expectedConnStat);

        // Make sure that the state is not reset when connStat: { collecting: ... }, is "mutated".
        state = convertPackets([atPacket('AT%XCONNSTAT=0'), OkPacket], state);
        expect(state.connStat?.collecting).toBe(false);
        state = convertPackets([atPacket('AT%XCONNSTAT=1'), OkPacket], state);
        expect(state.connStat?.collecting).toBe(true);

        expect(state.connStat).toEqual(expectedConnStat);
    });
});
