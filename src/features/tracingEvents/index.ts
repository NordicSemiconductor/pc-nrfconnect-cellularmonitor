/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { TraceEvent } from '../tracing/tracePacketEvents';
import * as at from './at';
import { parseAT, ParsedPacket, RequestType } from './at/parseAT';
import IPConverter from './ip';
import { nasConverter } from './nas';
import type { State } from './types';

export interface Processor {
    command: string;
    documentation: string;
    initialState: () => Partial<State>;
    onResponse: (
        packet: ParsedPacket,
        requestType?: RequestType
    ) => Partial<State>;
    onRequest?: (packet: ParsedPacket) => Partial<State>;
    onNotification?: (packet: ParsedPacket) => Partial<State>;
}

const processors = [
    at.functionMode,
    at.currentBand,
    at.modeOfOperation,
    at.signalQualityNotification,
    at.periodicTAU,
    at.modemParameters,
    at.pinCode,
    at.pinRetries,
    at.internationalMobileSubscriberIdentity,
    at.manufacturerIdentification,
    at.iccid,
    at.revisionIdentification,
    at.productSerialNumber,
    at.hardwareVersion,
    at.modemUUID,
    at.dataProfile,
    at.TXPowerReduction,
    at.extendedSignalQuality,
    at.activityStatus,
    at.networkRegistrationStatus,
] as const;

// Typescript challenge! Think it's related to the one above.
export const initialState = (): State =>
    processors.reduce(
        (state, processor) => ({ ...state, ...processor.initialState() }),
        {} as State
    );

let waitingAT: string;
let pendingRequestType: RequestType | null;
const getAndResetRequestType = () => {
    const requestTypeCopy =
        pendingRequestType !== null
            ? pendingRequestType
            : RequestType.NOT_A_REQUEST;
    pendingRequestType = null;
    return requestTypeCopy;
};

export const convert = (packet: TraceEvent, state: State): State => {
    if (packet.format === 'AT') {
        return convertAtPacket(packet, state);
    }

    if (packet.jsonData) {
        if (packet.format === 'NAS') {
            const newState = nasConverter(packet, state);
            return newState;
        }

        if (packet.format === 'IP') {
            return IPConverter(packet, state);
        }

        if (/lte-rrc.*/.test(packet.format)) {
            // suppose to be empty
        }
    }

    return state;
};

const convertAtPacket = (packet: TraceEvent, state: State) => {
    const parsedPacket = parseAT(packet);
    const { requestType, command } = parsedPacket;

    // request
    const processor = processors.find(p => p.command === command);

    // Explicit checks for readability.
    // Shorthand "if (requestType)"" would fail on undefined AND RequestType.NOT_A_REQUEST (due to it being a value 0)
    if (
        requestType !== undefined &&
        requestType !== RequestType.NOT_A_REQUEST
    ) {
        waitingAT = command ?? '';
        pendingRequestType = requestType;
        if (processor && processor.onRequest) {
            return {
                ...state,
                ...processor.onRequest(parsedPacket),
            };
        }
        return state;
    }

    // notification or response
    if (processor) {
        // response if true, otherwise a notification
        if (command === waitingAT) {
            waitingAT = '';
            return {
                ...state,
                ...processor.onResponse(parsedPacket, getAndResetRequestType()),
            };
        }

        const notification = processor.onNotification
            ? processor.onNotification(parsedPacket)
            : processor.onResponse(parsedPacket);
        return {
            ...state,
            ...notification,
        };
    }

    // response without command
    const responseProcessor = processors.find(p => p.command === waitingAT);
    if (responseProcessor) {
        waitingAT = '';

        const change = responseProcessor.onResponse(
            parsedPacket,
            getAndResetRequestType()
        );
        return {
            ...state,
            ...change,
        };
    }

    return state;
};