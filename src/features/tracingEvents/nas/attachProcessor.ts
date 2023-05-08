/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    parsePowerSavingMode,
    TAU_TYPES,
} from '../../../utils/powerSavingMode';
import {
    AccessPointName,
    PowerSavingModeEntries,
    State,
    Timers,
} from '../types';
import {
    AttachAcceptPacket,
    AttachCompletePacket,
    AttachPacket,
    AttachRejectPacket,
    AttachRequestPacket,
    DetachAcceptPacket,
    DetachRequestPacket,
} from './types';
import {
    extractPdnInfo,
    getKeyOfPacket,
    matchPacketIdWithHexValues,
    updateAccessPointNames,
} from './utils';

const emmTypes = [0x41, 0x42, 0x43, 0x44, 0x45, 0x46] as const;
enum NAS_MSG_EMM_TYPES {
    AttachRequest = 0x41,
    AttachAccept = 0x42,
    AttachComplete = 0x43,
    AttachReject = 0x44,
    DetachRequest = 0x45,
    DetachAccept = 0x46,
}

export default (packet: AttachPacket, state: State) => {
    if (assertIsAttachRequestPacket(packet)) {
        return processAttachRequestPacket(packet, state);
    }

    if (assertIsAttachAcceptPacket(packet)) {
        return processAttachAcceptPacket(packet, state);
    }

    if (assertIsAttachCompletePacket(packet)) {
        return processAttachCompletePacket(packet, state);
    }

    if (assertIsAttachRejectPacket(packet)) {
        return processAttachRejectPacket(packet, state);
    }

    if (assertIsDetachRequestPacket(packet)) {
        return processDetachRequestPacket(packet, state);
    }

    if (assertIsDetachAcceptPacket(packet)) {
        return processDetachAcceptPacket(packet, state);
    }

    return state;
};

export const processAttachRequestPacket = (
    packet: AttachRequestPacket,
    state: State
): State => {
    const newPsmValues = getPowerSavingEntriesFromPacket(packet);
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
        powerSavingMode: {
            requested: {
                // TODO: Should we also keep old values that are not picked up by the new packet?
                // e.g: ...state.powerSavingMode?.requested,
                ...newPsmValues,
            },
            granted: {
                ...state.powerSavingMode?.granted,
            },
        },
        accessPointNames,
    };
};

export const processAttachAcceptPacket = (
    packet: AttachAcceptPacket,
    state: State
): State => {
    const pdnInfo: AccessPointName = {
        ...extractPdnInfo(packet),
        state: 'Activate Default EPS Bearer Context Request',
        ipv6Complete: false,
    };

    const accessPointNames = updateAccessPointNames(
        pdnInfo,
        state.accessPointNames
    );

    return {
        ...state,
        powerSavingMode: {
            requested: {
                ...state.powerSavingMode?.requested,
            },
            granted: {
                // TODO: Should we also keep old values that are not picked up by the new packet?
                // e.g: ...state.powerSavingMode?.granted,
                ...getPowerSavingEntriesFromPacket(packet),
            },
        },
        accessPointNames,
        mnc: packet.mnc,
        mncCode: packet.mnc_code,
        mcc: packet.mcc,
        mccCode: packet.mcc_code,
    };
};

// TODO: Must decide if this is needed at all?
export const processAttachCompletePacket = (
    packet: AttachCompletePacket,
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
        lteState: 'CONNECTED',
    };
};

export const processAttachRejectPacket = (
    packet: AttachRejectPacket,
    state: State
): State => {
    const pdnInfo: AccessPointName = {
        ...extractPdnInfo(packet),
        state: 'PDN Connectivity Reject',
    };

    const accessPointNames = updateAccessPointNames(
        pdnInfo,
        state.accessPointNames
    );

    return {
        ...state,
        accessPointNames,
        lteState: 'IDLE',
    };
};

export const processDetachRequestPacket = (
    packet: DetachRequestPacket,
    state: State
): State => {
    const detachType =
        // eslint-disable-next-line no-underscore-dangle
        packet.raw?._source?.layers?.['nas-eps']?.['nas_eps.emm.switch_off'];
    // if the detach type is power off, then no response will be sent from the network.
    if (detachType && Number.parseInt(detachType, 10) === 1) {
        state.lteState = 'IDLE';
    }

    return state;
};

export const processDetachAcceptPacket = (
    packet: DetachAcceptPacket,
    state: State
): State => ({
    ...state,
    lteState: 'IDLE',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractEMM = (packet: any) => {
    const emm = packet.nas_msg_emm_type;
    // eslint-disable-next-line radix
    return emm != null ? parseInt(emm) : undefined;
};

export const assertIsAttachPacket = (
    packet: unknown
): packet is AttachPacket => {
    const packetId = extractEMM(packet);
    if (packet && packetId) {
        return matchPacketIdWithHexValues(emmTypes, packetId);
    }

    return false;
};

const assertIsAttachRequestPacket = (
    packet: AttachPacket
): packet is AttachRequestPacket =>
    extractEMM(packet) === NAS_MSG_EMM_TYPES.AttachRequest;

const assertIsAttachAcceptPacket = (
    packet: AttachPacket
): packet is AttachAcceptPacket =>
    extractEMM(packet) === NAS_MSG_EMM_TYPES.AttachAccept;

const assertIsAttachCompletePacket = (
    packet: AttachPacket
): packet is AttachCompletePacket =>
    extractEMM(packet) === NAS_MSG_EMM_TYPES.AttachComplete;

const assertIsAttachRejectPacket = (
    packet: AttachPacket
): packet is AttachRejectPacket =>
    extractEMM(packet) === NAS_MSG_EMM_TYPES.AttachReject;

const assertIsDetachRequestPacket = (
    packet: AttachPacket
): packet is DetachRequestPacket =>
    extractEMM(packet) === NAS_MSG_EMM_TYPES.DetachRequest;

const assertIsDetachAcceptPacket = (
    packet: AttachPacket
): packet is DetachAcceptPacket =>
    extractEMM(packet) === NAS_MSG_EMM_TYPES.DetachAccept;

// Only relevant timers for PSM
const timers: Timers[] = [
    'T3324', // Active Timer
    'T3412Extended', // Periodic TAU
    'T3412', // Periodic TAU (legacy)
];

const getPowerSavingEntriesFromPacket = (packet: AttachPacket) =>
    timers.reduce<PowerSavingModeEntries>((PsmEntries, lookupKey) => {
        const key = getKeyOfPacket(packet, lookupKey);
        if (key) {
            if (lookupKey === 'T3324') {
                PsmEntries[lookupKey] = parsePowerSavingMode(
                    packet[key].bitmask,
                    TAU_TYPES.ACTIVE_TIMER
                );
            } else if (lookupKey === 'T3412' || lookupKey === 'T3412Extended') {
                PsmEntries[lookupKey] = parsePowerSavingMode(
                    packet[key].bitmask,
                    TAU_TYPES.SLEEP_INTERVAL
                );
            }
        }
        return PsmEntries;
    }, {});
