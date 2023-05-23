/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { events, notifyListeners } from '../../tracing/tracePacketEvents';
import { convert } from '..';
import { State } from '../types';
import { initialState } from '.';
import { rawTraceData } from './traceSample';

const expectedState = {
    networkStatusLastUpdate: 'networkStatus',

    uiccInitialised: true,
    notifySignalQuality: true,
    signalQuality: {
        rsrp: 53,
        rsrp_threshold_index: 2,
        rsrp_decibel: 53 - 140,

        rsrq: 11,
        rsrq_threshold_index: 1,
        rsrq_decibel: 11 / 2 - 19.5,

        snr: 53,
        snr_decibel: 53 - 24,
    },
    notifyPeriodicTAU: false,
    operatorFullName: 'Telia N@',
    operatorShortName: 'Telia N@',
    plmn: '24202',
    tac: '0901',
    AcTState: 7,
    band: 20,
    cell_id: '02024720',
    phys_cell_id: 428,
    earfcn: 6300,
    NW_provided_eDRX_value: undefined,
    pinCodeStatus: 'READY',
    functionalMode: 1,
    IMEI: '352656106647673',
    manufacturer: 'Nordic Semiconductor ASA',
    revisionID: 'mfw_nrf9160_1.3.2',
    modeOfOperation: 2,
    availableBands: [1, 2, 3, 4, 5, 8, 12, 13, 18, 19, 20, 25, 26, 28, 66],
    pinRetries: { SIM_PIN: 3 },
    imsi: '204080813630037',
    iccid: '8901234567012345678F',
    currentBand: 13,
    networkStatus: 5,
    ci: '02024720',
    powerSavingMode: {
        requested: {
            state: 'on',
            T3324: {
                activated: true,
                bitmask: '00000000',
                unit: 'seconds',
                value: 0,
            },
            T3412Extended: {
                activated: true,
                bitmask: '10010100',
                unit: 'seconds',
                value: 600,
            },
        },
        granted: {
            T3324: {
                activated: false,
                bitmask: '11100000',
            },
            T3412: {
                activated: true,
                bitmask: '01001001',
                unit: 'seconds',
                value: 324000,
            },
            T3412Extended: {
                activated: false,
                bitmask: '11100000',
            },
            state: 'off',
        },
    },

    networkStatusNotifications: 5,
    signalingConnectionStatusNotifications: 1,
    modemSupportLTEM: true,
    modemSupportNBIoT: false,
    modemSupportGNSS: true,
    modemSystemPreference: 0,
    xModemTraceOperation: 1,
    xModemTraceSetID: 2,
    rrcState: 1,
    mdmevNotification: 1,
    modemDomainEvents: ['SEARCH STATUS 2'],

    networkTimeNotifications: 1,
    networkTimeNotification: {
        localTimeZone: '80',
        universalTime: '22016021225580',
        daylightSavingTime: '01',
    },
    accessPointNames: {
        'ibasis.iot': {
            cid: 0,
            pdnType: 'IP',
            apn: 'ibasis.iot',
            ipv4: '10.160.148.98',
        },
    },
} as Partial<State>;

test('Trace is read properly', () => {
    let state = initialState();
    let sequenceNumber = 0;
    rawTraceData.forEach(jsonPacket => {
        notifyListeners([
            {
                format: jsonPacket.format,
                packet_data: new Uint8Array(jsonPacket.packet_data.data),
                sequence_number: (sequenceNumber += 1),
            },
        ]);
    });
    events.forEach(packet => {
        state = convert(packet, state);
    });
    expect(state).toEqual(expectedState);
});
