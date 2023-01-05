/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { processor as currentBand } from './at/commandProcessors/currentBand';
import { processor as dataProfile } from './at/commandProcessors/dataProfile';
import { processor as activityStatus } from './at/commandProcessors/deviceActivityStatus';
import { processor as extendedSignalQuality } from './at/commandProcessors/extendedSignalQuality';
import { processor as functionMode } from './at/commandProcessors/functionMode';
import { processor as hardwareVersion } from './at/commandProcessors/hardwareVersion';
import { processor as iccid } from './at/commandProcessors/iccid';
import { processor as internationalMobileSubscriberIdentity } from './at/commandProcessors/internationalMobileSubscriberIdentity';
import { processor as manufacturerIdentification } from './at/commandProcessors/manufacturerIdentification';
import { processor as modemParameters } from './at/commandProcessors/modemParameters';
import { processor as modemUUID } from './at/commandProcessors/modemUUID';
import { processor as modeOfOperation } from './at/commandProcessors/modeOfOperation';
import { processor as networkRegistrationStatus } from './at/commandProcessors/networkRegistrationStatusNotification';
import { processor as periodicTAU } from './at/commandProcessors/periodicTAU';
import { processor as pinCode } from './at/commandProcessors/pinCode';
import { processor as pinRetries } from './at/commandProcessors/pinRetries';
import { processor as productSerialNumber } from './at/commandProcessors/productSerialNumberId';
import { processor as revisionIdentification } from './at/commandProcessors/revisionIdentification';
import { processor as signalQualityNotification } from './at/commandProcessors/signalQualityNotification';
import { processor as TXPowerReduction } from './at/commandProcessors/TXPowerReduction';
import { parseAT, ParsedPacket, RequestType } from './at/parseAT';

export type RRCState =
    | 'rrcConnectionSetupRequest'
    | 'rrcConnectionSetup'
    | 'rrcConnectionSetupComplete'
    | 'rrcConnectionRelease';

export interface Packet {
    packet_data: Uint8Array;
    format: string;
    timestamp?: {
        resolution?: string;
        value?: number;
    };
    interpreted_json?: unknown;
}

export interface Processor<VM> {
    command: string;
    documentation: string;
    initialState: () => VM;
    onResponse: (
        packet: ParsedPacket,
        requestType?: RequestType
    ) => Partial<VM>;
    onRequest?: (packet: ParsedPacket) => Partial<VM>;
    onNotification?: (packet: ParsedPacket) => Partial<VM>;
}

type ExtractViewModel<Type> = Type extends Processor<infer X> ? X : never;

type GetKeys<T> = T extends T ? keyof T : never;
type UnionToIntersection<T> = {
    [K in GetKeys<T>]: T extends Partial<Record<K, unknown>> ? T[K] : never;
};

// To replace < | undefined> types with proper optional ? types, add this flag to tsconfig.json "exactOptionalPropertyTypes": true
export type State = UnionToIntersection<
    ExtractViewModel<typeof processors[number]> & { rrcState?: RRCState }
>;

const processors = [
    functionMode,
    currentBand,
    modeOfOperation,
    signalQualityNotification,
    periodicTAU,
    modemParameters,
    pinCode,
    pinRetries,
    internationalMobileSubscriberIdentity,
    manufacturerIdentification,
    iccid,
    revisionIdentification,
    productSerialNumber,
    hardwareVersion,
    modemUUID,
    dataProfile,
    TXPowerReduction,
    extendedSignalQuality,
    activityStatus,
    networkRegistrationStatus,
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

export const convert = (packet: TraceEvent, state: State): State => {
    if (packet.format !== 'AT') {
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
