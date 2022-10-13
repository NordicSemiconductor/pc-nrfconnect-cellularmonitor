/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '.';
import { getParametersFromResponse } from './utils';

enum regStatus {
    NOT_REGISTERED = 0,
    REGISTERED = 1,
    NOT_REGISTERED_SEARCHING = 2,
    REGISTRATION_DENIED = 3,
    UNKNOWN = 4,
    REGISTERED_ROAMING = 5,
    UUIC_FAILURE = 90,
}

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
    response(packet) {
        if (packet.status?.startsWith('OK')) {
            const responseParameters = getParametersFromResponse(packet.body);
            if (!responseParameters) {
                return {};
            }

            const parsedAcT = parseInt(responseParameters[5], 10);
            const evaluatedAcT =
                parsedAcT === 7 || parsedAcT === 9 ? parsedAcT : undefined;

            return {
                xmonitor: {
                    regStatus: parseInt(responseParameters[0], 10),
                    operatorFullName: responseParameters[1],
                    operatorShortName: responseParameters[2],
                    plmn: responseParameters[3],
                    tac: responseParameters[4],
                    AcT: evaluatedAcT,
                    band: parseInt(responseParameters[6], 10),
                    cell_id: responseParameters[7],
                    phys_cell_id: parseInt(responseParameters[8], 10),
                    EARFCN: parseInt(responseParameters[9], 10),
                    rsrp: parseInt(responseParameters[10], 10),
                    snr: parseInt(responseParameters[11], 10),
                    NW_provided_eDRX_value: responseParameters[12],
                    // Response is always either
                    // activeTime & periodicTAU, or
                    // activeTime & periodicTAUext & periodicTAU
                    activeTime: responseParameters[13],
                    periodicTAU:
                        responseParameters.length === 15
                            ? responseParameters[14]
                            : responseParameters[15],
                    periodicTAUext:
                        responseParameters.length === 16
                            ? responseParameters[14]
                            : undefined,
                },
            };
        }
        return {};
    },
};
