/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import { getParametersFromResponse } from '../utils';

// enum regStatus {
//     NOT_REGISTERED = 0,
//     REGISTERED = 1,
//     NOT_REGISTERED_SEARCHING = 2,
//     REGISTRATION_DENIED = 3,
//     UNKNOWN = 4,
//     REGISTERED_ROAMING = 5,
//     UUIC_FAILURE = 90,
// }

type ViewModel = {
    xmonitor?: {
        regStatus?: number;
        operatorFullName?: string;
        operatorShortName?: string;
        plmn?: string;
        tac?: string;
        AcT?: 7 | 9;
        band?: number;
        cell_id?: string;
        phys_cell_id?: number;
        EARFCN?: number;
        rsrp?: number;
        snr?: number;
        NW_provided_eDRX_value?: string;
        // Response is always either
        // activeTime & periodicTAU, or
        // activeTime & periodicTAUext & periodicTAU
        activeTime?: string;
        periodicTAU?: string;
        periodicTAUext?: string;
    };
};

export const processor: Processor<ViewModel> = {
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
