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

    expect(state.eDrxLteM).toEqual({
        requestedValue: '0011',
        nwProvidedValue: '0010',
        pagingTimeWindow: '1001',
    });
});
