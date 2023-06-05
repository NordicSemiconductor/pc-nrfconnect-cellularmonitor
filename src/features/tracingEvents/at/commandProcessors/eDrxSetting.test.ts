/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, OkPacket } from '../testUtils';

test('eDRX Setting', () => {
    let state = convertPackets([atPacket('AT+CEDRXS=2,4,"1001"'), OkPacket]);
    expect(state.eDrxLteM.requestedValue).toBe('1001');

    // +CEDRXP: <AcT-type>[,<Requested_eDRX_value>[,<NW-provided_eDRX_value> [,<Paging_time_window>]]]
    state = convertPackets([atPacket('+CEDRXS: 4,"1001","0101","1011"')]);
    expect(state.eDrxLteM).toEqual({
        requestedValue: '1001',
        nwProvidedValue: '0101',
        pagingTimeWindow: '1011',
    });

    state = convertPackets([atPacket('+CEDRXS: 5,"1101","0101","1011"')]);
    expect(state.eDrxNbIot).toEqual({
        requestedValue: '1101',
        nwProvidedValue: '0101',
        pagingTimeWindow: '1011',
    });
});
