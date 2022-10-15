/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { processor as currentBand } from './currentBand';
import { processor as functionMode } from './functionMode';
import { processor as modemParameters } from './modemParameters';
import { processor as modeOfOperation } from './modeOfOperation';
import { parseAT } from './parseAT';
import { processor as periodicTAU } from './periodicTAU';
import { processor as pinCode } from './pinCode';
import { processor as pinRetries } from './pinRetries';
import { processor as iccid } from './iccid';
import { processor as signalQuality } from './signalQuality';
import { processor as internationMobileSubscriberIdentity } from './internationMobileSubscriberIdentity';
import { processor as manufacturerIdentification } from './manufacturerIdentification';

export interface Packet {
    packet_data: Uint8Array;
    format: 'at';
    // timestamp?: {
    //     resolution?: string;
    //     value?: number;
    // };
}

export interface Processor<VM> {
    command: string;
    documentation: string;
    initialState: () => VM;
    response: (packet: ParsedPacket) => Partial<VM>;
    request?: (packet: ParsedPacket) => Partial<VM>;
    notification?: (packet: ParsedPacket) => Partial<VM>;
}

export interface ParsedPacket {
    command?: string;
    operator?: string;
    body?: string;
    isRequest?: boolean;
    lastLine?: string;
    status?: string; // 'OK | 'ERROR'
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
    internationMobileSubscriberIdentity,
    manufacturerIdentification,
    iccid,
] as const;

// Typescript challange! Think it's related to the one above.
export const initialState = (): State =>
    processors.reduce(
        (state, processor) => ({ ...state, ...processor.initialState() }),
        {} as State
    );

function castToState<T>(state: State, partialState: T): State {
    return { ...state, ...partialState } as State;
}

let waitingAT: string;

export const convert = (packet: Packet, state: State): State => {
    if (packet.format !== 'at') {
        return state;
    }

    const parsedPacket = parseAT(packet);
    const { isRequest, lastLine, command } = parsedPacket;

    // request
    const processor = processors.find(p => p.command === command);
    if (isRequest) {
        waitingAT = command ?? '';
        if (processor && processor.request) {
            return castToState(state, processor.request(parsedPacket));
        }
        return state;
    }

    // notification or response
    if (processor) {
        // response if true, otherwise a notification
        if (command === waitingAT) {
            waitingAT = '';
            return castToState(state, processor.response(parsedPacket));
        }
        const notification = processor.notification
            ? processor.notification(parsedPacket)
            : processor.response(parsedPacket);
        return castToState(state, notification);
    }

    // response without command
    const responseProcessor = processors.find(p => p.command === waitingAT);
    if (responseProcessor) {
        waitingAT = '';

        const change = responseProcessor.response(parsedPacket);
        return castToState(state, change);
    }

    // eslint-disable-next-line no-empty
    if (lastLine?.startsWith('ERROR')) {
    }

    // eslint-disable-next-line no-empty
    if (lastLine?.startsWith('+CME ERROR')) {
    }

    // eslint-disable-next-line no-empty
    if (lastLine?.startsWith('+CMS ERROR')) {
    }

    return state;
};
