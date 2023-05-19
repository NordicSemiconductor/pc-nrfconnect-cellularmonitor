/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AccessPointNames } from '../../types';
import type { Processor } from '..';
import { getNumberArray } from '../utils';

const PacketDomainEvent = {
    NW_DETACH: 'NW DETACH',
    ME_DETACH: 'ME DETACH',
    ME_OVERHEATED: 'ME OVERHEATED',
    ME_BATTERY_LOW: 'ME BATTERY LOW',
    ME_PDN_ACT: 'ME PDN ACT',
    NW_ACT: 'NW ACT',
    NW_PDN_DEACT: 'NW PDN DEACT',
    ME_PDN_DEACT: 'ME PDN DEACT',
    NW_DEACT: 'NW DEACT',
    ME_DEACT: 'ME DEACT',
    NW_MODIFY: 'NW MODIFY',
    ME_MODIFY: 'ME MODIFY',
    IPV6: 'IPV6',
    IPV6_FAIL: 'IPV6 FAIL',
    RESTR: 'RESTR',
    APNRATECTRL_CFG: 'APNRATECTRL CFG',
    APNRATECTRL_STATUS: 'APNRATECTRL STAT',
};

export const processor: Processor<'+CGEV'> = {
    command: '+CGEV',
    documentation:
        'https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/packet_domain/cgev.html',
    initialState: () => ({}),
    onResponse: (packet, state) => {
        if (packet.payload) {
            const payload = packet.payload.trim();

            // The 17 different cases based on the +CGEV notifactions
            if (payload === PacketDomainEvent.NW_DETACH) {
                return {
                    ...state,
                    // networkStatus update?
                    packetDomainStatus: 'Network Detached',
                    networkStatusLastUpdate: 'packetDomainEvent',
                    accessPointNames: {},
                };
            }
            if (payload === PacketDomainEvent.ME_DETACH) {
                return {
                    ...state,
                    // networkStatus update?
                    packetDomainStatus: 'User Equipment Detached',
                    networkStatusLastUpdate: 'packetDomainEvent',
                    accessPointNames: {},
                };
            }
            if (payload === PacketDomainEvent.ME_OVERHEATED) {
                // TODO: should notify user about overheated
                return state;
            }
            if (payload === PacketDomainEvent.ME_BATTERY_LOW) {
                // TODO: should notify user about low battery
                return state;
            }

            if (payload.includes(PacketDomainEvent.ME_PDN_ACT)) {
                const [cid, reason] = stringMultiTool(
                    payload,
                    PacketDomainEvent.ME_PDN_ACT
                );
                const apnToUpdate = getAccessPointName(
                    cid,
                    state.accessPointNames
                );

                if (reason != null) {
                    if (reason === 0) apnToUpdate.info = 'IPv4 Only';
                    if (reason === 1) apnToUpdate.info = 'IPv6 Only';
                    if (reason === 2)
                        apnToUpdate.info = 'Only single access bearers allowed';
                    if (reason === 3)
                        apnToUpdate.info =
                            'Only single access bearers allowed and context activation for a second address type bearer was not successful.';
                }

                return {
                    ...state,
                    accessPointNames: {
                        ...state.accessPointNames,
                        [cid]: apnToUpdate,
                    },
                };
            }

            if (payload.includes(PacketDomainEvent.NW_ACT)) {
                const [cid, pcid, eventType] = stringMultiTool(
                    payload,
                    PacketDomainEvent.NW_ACT
                );
                const apnToUpdate = getAccessPointName(
                    cid,
                    state.accessPointNames
                );
                if (pcid) {
                    apnToUpdate.pcid = pcid;
                }
                if (eventType) {
                    apnToUpdate.eventType = eventType;
                }

                return {
                    ...state,
                    accessPointNames: {
                        ...state.accessPointNames,
                        [cid]: apnToUpdate,
                    },
                };
            }

            if (payload.includes(PacketDomainEvent.NW_PDN_DEACT)) {
                const [cid] = stringMultiTool(
                    payload,
                    PacketDomainEvent.NW_PDN_DEACT
                );

                const updatedApns = removeAccessPointName(
                    cid,
                    state.accessPointNames
                );

                return {
                    ...state,
                    accessPointNames: updatedApns,
                };
            }

            if (payload.includes(PacketDomainEvent.ME_PDN_DEACT)) {
                const [cid] = stringMultiTool(
                    payload,
                    PacketDomainEvent.ME_PDN_DEACT
                );

                const updatedApns = removeAccessPointName(
                    cid,
                    state.accessPointNames
                );

                return {
                    ...state,
                    accessPointNames: updatedApns,
                };
            }

            if (payload.includes(PacketDomainEvent.NW_DEACT)) {
                // TODO: need a way to verify on eventType === 1
                return state;
            }

            if (payload.includes(PacketDomainEvent.ME_DEACT)) {
                // TODO: need a way to verify on eventType === 1
                return state;
            }

            if (payload.includes(PacketDomainEvent.NW_MODIFY)) {
                // TODO: need a way to verify on eventType === 1
                return state;
            }

            if (payload.includes(PacketDomainEvent.ME_MODIFY)) {
                // TODO: need a way to verify on eventType === 1
                return state;
            }

            // Need to be run before 'IPV6', because IPV6 is included in 'IPV6 FAIL'
            if (payload.includes(PacketDomainEvent.IPV6_FAIL)) {
                // TODO: find out what to do about this?
                return state;
            }

            if (payload.includes(PacketDomainEvent.IPV6)) {
                // TODO: find out what to do about this?
                return state;
            }

            if (payload.includes(PacketDomainEvent.RESTR)) {
                // TODO: find out what to do about this?
                return state;
            }

            if (payload.includes(PacketDomainEvent.APNRATECTRL_CFG)) {
                // TODO: find out what to do about this?
                return state;
            }

            if (payload.includes(PacketDomainEvent.APNRATECTRL_STATUS)) {
                // TODO: find out what to do about this?
                return state;
            }
        }
        return state;
    },
};

const stringMultiTool = (payload: string, searchWord: string) => {
    const processedPayload = payload
        .slice(payload.indexOf(searchWord) + searchWord.length)
        .trim();
    return getNumberArray(processedPayload);
};

const getAccessPointName = (cid: number, apns: AccessPointNames) => {
    const result = Object.entries(apns).find(([, value]) => value.cid === cid);
    if (result) {
        return apns[result[0]];
    }
    return apns[cid] ?? { cid };
};

const removeAccessPointName = (
    cid: number,
    apns: AccessPointNames
): AccessPointNames =>
    Object.fromEntries(
        Object.entries(apns).filter(([, value]) => value.cid !== cid)
    );
