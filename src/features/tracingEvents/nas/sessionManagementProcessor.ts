/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AccessPointName, State } from '../types';
import {
    ActivateDefaultEpsBearerContextAccept,
    ActivateDefaultEpsBearerContextRequest,
    ConnectivityPacket,
    PdnConnectivityRequest,
} from './types';
import {
    compareHexAndDecimalStrings,
    extractPdnInfo,
    updateAccessPointNames,
} from './utils';

const esmTypes = ['0xd0', '0xc1', '0xc2'] as const;

enum ESMTypes {
    ConnectivityRequest = 0xd0,
    ActivateDefaultEPSBearerContextRequest = 0xc1,
    ActivateDefaultEPSBearerContextAccept = 0xc2,
}

export default (packet: ConnectivityPacket, state: State) => {
    if (assertIsPdnConnectivityRequest(packet)) {
        return processConnectivityRequest(packet, state);
    }

    if (assertIsActivateDefaultEpsBearerRequest(packet)) {
        return processActivateDefaultEpsBearerRequest(packet, state);
    }

    if (assertIsActivateDefaultEpsBearerAccept(packet)) {
        return processActivateDefaultEpsBearerAccept(packet, state);
    }

    return state;
};

const processConnectivityRequest = (
    packet: PdnConnectivityRequest,
    state: State
): State => {
    const pdnInfo: AccessPointName = {
        ...extractPdnInfo(packet),
        state: 'PDN Connectivity Request',
    };

    const accessPointNames = updateAccessPointNames(
        pdnInfo,
        state.accessPointNames
    );

    return {
        ...state,
        accessPointNames,
    };
};

const processActivateDefaultEpsBearerRequest = (
    packet: ActivateDefaultEpsBearerContextRequest,
    state: State
): State => {
    const pdnInfo: AccessPointName = {
        ...extractPdnInfo(packet),
        state: 'Activate Default EPS Bearer Context Request',
    };

    const accessPointNames = updateAccessPointNames(
        pdnInfo,
        state.accessPointNames
    );

    return {
        ...state,
        accessPointNames,
    };
};

const processActivateDefaultEpsBearerAccept = (
    packet: ActivateDefaultEpsBearerContextAccept,
    state: State
): State => {
    const pdnInfo: AccessPointName = {
        ...extractPdnInfo(packet),
        state: 'Activate Default EPS Bearer Context Accept',
    };

    const accessPointNames = updateAccessPointNames(
        pdnInfo,
        state.accessPointNames
    );

    return {
        ...state,
        accessPointNames,
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractESM = (packetData: any) => {
    const result =
        // eslint-disable-next-line no-underscore-dangle
        packetData?.raw?._source?.layers['nas-eps']['nas_eps.nas_msg_esm_type'];
    return result;
};

export function assertIsPdnConnectivityPacket(
    packetData: unknown
): packetData is ConnectivityPacket {
    if (packetData && extractESM(packetData) != null) {
        return compareHexAndDecimalStrings(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            esmTypes as any as string[],
            extractESM(packetData)
        );
    }

    return false;
}

const assertIsPdnConnectivityRequest = (
    packet: ConnectivityPacket
): packet is PdnConnectivityRequest =>
    parseInt(extractESM(packet), 16) === ESMTypes.ConnectivityRequest;

const assertIsActivateDefaultEpsBearerRequest = (
    packet: ConnectivityPacket
): packet is ActivateDefaultEpsBearerContextRequest =>
    parseInt(extractESM(packet), 16) ===
    ESMTypes.ActivateDefaultEPSBearerContextRequest;

const assertIsActivateDefaultEpsBearerAccept = (
    packet: ConnectivityPacket
): packet is ActivateDefaultEpsBearerContextRequest =>
    parseInt(extractESM(packet), 16) ===
    ESMTypes.ActivateDefaultEPSBearerContextAccept;
