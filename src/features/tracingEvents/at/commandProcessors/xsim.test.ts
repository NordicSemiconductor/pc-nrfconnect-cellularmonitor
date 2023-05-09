/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets } from '../testUtils';

test('%XSIM updates state according to read response', () => {
    let state = convertPackets([
        atPacket('AT%XSIM?'),
        atPacket('%XSIM: 1\r\nOK\r\n'),
    ]);
    expect(state.uiccInitialised).toBe(true);

    state = convertPackets([
        atPacket('AT%XSIM?'),
        atPacket('%XSIM: 0,1\r\nOK\r\n'),
    ]);
    expect(state.uiccInitialised).toBe(false);
    expect(state.uiccInitialisedErrorCause).toBe('PIN required');
    expect(state.uiccInitialisedErrorCauseCode).toBe(1);
});
