/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Processor } from '..';
import {isValidAcTState} from '../../types';
import { getNumber, getParametersFromResponse } from '../utils';

export const processor: Processor<'%XMONITOR'> = {
    command: '%XMONITOR',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/nw_service/xmonitor.html',
    initialState: () => ({
        regStatus: 0,
    }),
    onResponse: (packet, state) => {
        if (packet.status === 'OK') {
            const responseArray = getParametersFromResponse(packet.payload);
            if (responseArray.length !== 15 && responseArray.length !== 16) {
                return state;
            }

            const rawAcT = getNumber(responseArray[5]);
            const AcTState = isValidAcTState(rawAcT) ? rawAcT : undefined;

            return {
                ...state,
                regStatus: getNumber(responseArray[0]),
                operatorFullName: responseArray[1],
                operatorShortName: responseArray[2],
                plmn: responseArray[3],
                tac: responseArray[4],
                AcTState,
                band: getNumber(responseArray[6]),
                cell_id: responseArray[7],
                phys_cell_id: getNumber(responseArray[8]),
                earfcn: getNumber(responseArray[9]),
                rsrp: getNumber(responseArray[10]),
                snr: getNumber(responseArray[11]),
                NW_provided_eDRX_value: responseArray[12],
                // Response is always either
                // activeTime & periodicTAU, or
                // activeTime & periodicTAUext & periodicTAU
                //activeTime: responseArray[13],
                //periodicTAU:
                //responseArray.length === 15
                //        ? responseArray[14]
                //        : responseArray[15],
                //periodicTAUext:
                    //responseArray.length === 16 ? responseArray[14] : undefined,
            };
        }
        return state;
    },
};
