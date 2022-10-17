/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { processor as currentBand } from './currentBand';
import { processor as functionMode } from './functionMode';
import { processor as iccid } from './iccid';
import { processor as internationalMobileSubscriberIdentity } from './internationalMobileSubscriberIdentity';
import { processor as manufacturerIdentification } from './manufacturerIdentification';
import { processor as modemParameters } from './modemParameters';
import { processor as modeOfOperation } from './modeOfOperation';
import { parseAT, ParsedPacket, RequestType } from './parseAT';
import { processor as periodicTAU } from './periodicTAU';
import { processor as pinCode } from './pinCode';
import { processor as pinRetries } from './pinRetries';
import { processor as signalQuality } from './signalQuality';

export interface Packet {
    packet_data: Uint8Array;
    format: 'at';
    timestamp?: {
        resolution?: string;
        value?: number;
    };
}

export interface Processor<VM> {
    command: string;
    documentation: string;
    initialState: () => VM;
    onResponse: (
        packet: ParsedPacket,
        requestType?: RequestType
    ) => Partial<VM>;
    onRequest?: (
        packet: ParsedPacket,
        requestType?: RequestType
    ) => Partial<VM>;
    onNotification?: (packet: ParsedPacket) => Partial<VM>;
}

type ExtractViewModel<Type> = Type extends Processor<infer X> ? X : never;

type GetKeys<T> = T extends T ? keyof T : never;
type UnionToIntersection<T> = {
    [K in GetKeys<T>]: T extends Partial<Record<K, unknown>> ? T[K] : never;
};

// To replace < | undefined> types with proper optional ? types, add this flag to tsconfig.json "exactOptionalPropertyTypes": true
export type State = UnionToIntersection<
    ExtractViewModel<typeof processors[number]>
>;

// // Typescript challenge! Make this state object by iterating over the processors array below.
// export type State = ExtractViewModel<typeof functionMode> &
//     ExtractViewModel<typeof currentBand> &
//     ExtractViewModel<typeof modeOfOperation> &
//     ExtractViewModel<typeof periodicTAU> &
//     ExtractViewModel<typeof signalQuality> &
//     ExtractViewModel<typeof modemParameters> &
//     ExtractViewModel<typeof pinCode> &
//     ExtractViewModel<typeof pinRetries>;

const processors = [
    functionMode,
    currentBand,
    modeOfOperation,
    signalQuality,
    periodicTAU,
    modemParameters,
    pinCode,
    pinRetries,
    internationalMobileSubscriberIdentity,
    manufacturerIdentification,
    iccid,
] as const;

// Typescript challange! Think it's related to the one above.
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

export const convert = (packet: Packet, state: State): State => {
    if (packet.format !== 'at') {
        return state;
    }

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
                ...processor.onRequest(parsedPacket, requestType),
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
