/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';

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
            if (packet.body.length !== 15 && packet.body.length !== 16) {
                return {};
            }

            const parsedAcT = parseInt(packet.body[5], 10);
            const evaluatedAcT =
                parsedAcT === 7 || parsedAcT === 9 ? parsedAcT : undefined;

            return {
                xmonitor: {
                    regStatus: parseInt(packet.body[0], 10),
                    operatorFullName: packet.body[1],
                    operatorShortName: packet.body[2],
                    plmn: packet.body[3],
                    tac: packet.body[4],
                    AcT: evaluatedAcT,
                    band: parseInt(packet.body[6], 10),
                    cell_id: packet.body[7],
                    phys_cell_id: parseInt(packet.body[8], 10),
                    EARFCN: parseInt(packet.body[9], 10),
                    rsrp: parseInt(packet.body[10], 10),
                    snr: parseInt(packet.body[11], 10),
                    NW_provided_eDRX_value: packet.body[12],
                    // Response is always either
                    // activeTime & periodicTAU, or
                    // activeTime & periodicTAUext & periodicTAU
                    activeTime: packet.body[13],
                    periodicTAU:
                        packet.body.length === 15
                            ? packet.body[14]
                            : packet.body[15],
                    periodicTAUext:
                        packet.body.length === 16 ? packet.body[14] : undefined,
                },
            };
        }
        return {};
    },
};
