/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { getParametersFromResponse } from '../utils';

export const processor: Processor = {
    command: '%XMONITOR',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/nw_service/xmonitor.html',
    initialState: () => ({
        xmonitor: {
            regStatus: 0,
        },
    }),
    onResponse: packet => {
        if (packet.status === 'OK') {
            const responseArray = getParametersFromResponse(packet.payload);
            if (responseArray.length !== 15 && responseArray.length !== 16) {
                return {};
            }

            const parsedAcT = parseInt(responseArray[5], 10);
            const evaluatedAcT =
                parsedAcT === 7 || parsedAcT === 9 ? parsedAcT : undefined;

            return {
                xmonitor: {
                    regStatus: parseInt(responseArray[0], 10),
                    operatorFullName: responseArray[1],
                    operatorShortName: responseArray[2],
                    plmn: responseArray[3],
                    tac: responseArray[4],
                    AcT: evaluatedAcT,
                    band: parseInt(responseArray[6], 10),
                    cell_id: responseArray[7],
                    phys_cell_id: parseInt(responseArray[8], 10),
                    EARFCN: parseInt(responseArray[9], 10),
                    rsrp: parseInt(responseArray[10], 10),
                    snr: parseInt(responseArray[11], 10),
                    NW_provided_eDRX_value: responseArray[12],
                    // Response is always either
                    // activeTime & periodicTAU, or
                    // activeTime & periodicTAUext & periodicTAU
                    activeTime: responseArray[13],
                    periodicTAU:
                        responseArray.length === 15
                            ? responseArray[14]
                            : responseArray[15],
                    periodicTAUext:
                        responseArray.length === 16
                            ? responseArray[14]
                            : undefined,
                },
            };
        }
        return {};
    },
};
