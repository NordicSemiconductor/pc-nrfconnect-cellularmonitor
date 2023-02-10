/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets } from '../testUtils';

test('+CEDRXRDP eDRX Dynamic Parameters should properly write to state', () => {
    const state = convertPackets([
        atPacket('AT+CEDRXRDP'),
        atPacket('+CEDRXRDP: 4,"0011","0010","1001"\r\nOK\r\n'),
    ]);

    expect(state.AcTState).toBe(4);
    expect(state.requested_eDRX_value).toBe('0011');
    expect(state.NW_provided_eDRX_value).toBe('0010');
    expect(state.pagingTimeWindow).toBe('1001');
});
