/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable radix */

import {
    parsePowerSavingMode,
    TAU_TYPES,
} from '../../../utils/powerSavingMode';
import { TraceEvent } from '../../tracing/tracePacketEvents';
import {
    AccessPointName,
    PowerSavingModeEntries,
    State,
    TimerKey,
    Timers,
} from '../types';
import connectivityProcessor, {
    assertIsPdnConnectivityPacket,
} from './sessionManagementProcessor';
import {
    AttachAcceptPacket,
    AttachCompletePacket,
    AttachPacket,
    AttachRejectPacket,
    AttachRequestPacket,
} from './types';
import {
    compareHexAndDecimalStrings,
    extractPdnInfo,
    updateAccessPointNames,
} from './utils';

const attachValues = ['0x41', '0x42', '0x43', '0x44'] as const;

// Only relevant timers for PSM
const timers: Timers[] = [
    'T3324', // Active Timer
    'T3412Extended', // Periodic TAU
    'T3412', // Periodic TAU (legacy)
];

const assertIsAttachPacket = (packet: unknown): packet is AttachPacket => {
    if (packet && (packet as AttachPacket).nas_msg_emm_type) {
        return compareHexAndDecimalStrings(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            attachValues as any as string[],
            (packet as AttachPacket).nas_msg_emm_type
        );
    }

    return false;
};

const assertIsAttachRequestPacket = (
    packet: AttachPacket
): packet is AttachRequestPacket => parseInt(packet.nas_msg_emm_type) === 65; // '0x41' or '65';

const assertIsAttachAcceptPacket = (
    packet: AttachPacket
): packet is AttachAcceptPacket => parseInt(packet.nas_msg_emm_type) === 66; // '0x42' or '66';

const assertIsAttachCompletePacket = (
    packet: AttachPacket
): packet is AttachCompletePacket => parseInt(packet.nas_msg_emm_type) === 67; // '0x43' or '67';

const assertIsAttachRejectPacket = (
    packet: AttachPacket
): packet is AttachRejectPacket => parseInt(packet.nas_msg_emm_type) === 68; // '0x44' or '68';

export default (packet: TraceEvent, state: State) => {
    if (packet.jsonData) {
        const packetData: unknown = packet.jsonData;
        if (assertIsAttachPacket(packetData)) {
            if (assertIsAttachRequestPacket(packetData)) {
                return processAttachRequestPacket(packetData, state);
            }

            if (assertIsAttachAcceptPacket(packetData)) {
                return processAttachAcceptPacket(packetData, state);
            }

            if (assertIsAttachCompletePacket(packetData)) {
                return processAttachCompletePacket(packetData, state);
            }

            if (assertIsAttachRejectPacket(packetData)) {
                return processAttachRejectPacket(packetData, state);
            }
        }
        if (assertIsPdnConnectivityPacket(packetData)) {
            return connectivityProcessor(packetData, state);
        }
    }

    return state;
};

const getKeyOfPacket = (
    packet: AttachPacket,
    lookup: Timers
): TimerKey | undefined => {
    const predicate = lookup.includes('Extended')
        ? (key: string) => key.includes(lookup.replace('Extended', '_extended'))
        : (key: string) => key.includes(lookup) && !key.includes('extended');
    return Object.keys(packet).find(key => predicate(key)) as
        | TimerKey
        | undefined;
};

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

export const processAttachRequestPacket = (
    packet: AttachRequestPacket,
    state: State
): State => {
    const newPsmValues = getPowerSavingEntriesFromPacket(packet);
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
    };
};

// Should report that attach was rejected.
export const processAttachRejectPacket = (
    _packet: AttachRejectPacket,
    state: State
): State => state;
