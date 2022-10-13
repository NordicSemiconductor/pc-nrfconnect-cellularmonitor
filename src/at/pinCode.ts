/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Packet, ViewModel } from '../state';

export const convert = (packet: Packet, state: ViewModel): Partial<ViewModel> =>
    // const payload = packet.packet_data.toString().toLowerCase();

    // // #### AT+<CMD>
    // if (payload.startsWith('at')) {
    //     if (payload.includes('+cpin')) {
    //         return {
    //             waitingAT: '+cpin',
    //         };
    //     }
    // }

    // // #### +<CMD> <OK>
    // if (payload.includes('+cpin')) {
    //     if (payload.includes('ready')) {
    //         return { pinState: 'ready', waitingAT: null };
    //     }
    // }

    // // #### <OK> or <ERROR>
    // if (payload.includes('error')) {
    //     if (state.waitingAT === '+cpin') {
    //         return { pinState: 'error', waitingAT: null };
    //     }
    // }

    ({});
