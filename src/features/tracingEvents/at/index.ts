/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TraceEvent } from '../../tracing/tracePacketEvents';
import { State } from '../types';
import { processor as connectivityStatistics } from './commandProcessors/connectivityStatistics';
import { processor as currentBand } from './commandProcessors/currentBand';
import { processor as dataProfile } from './commandProcessors/dataProfile';
import { processor as activityStatus } from './commandProcessors/deviceActivityStatus';
import { processor as edrxdynamicparameters } from './commandProcessors/eDRXDynamicParameters';
import { processor as evaluatingConnectionParameters } from './commandProcessors/evaluatingConnectionParameters';
import { processor as extendedSignalQuality } from './commandProcessors/extendedSignalQuality';
import { processor as functionMode } from './commandProcessors/functionMode';
import { processor as hardwareVersion } from './commandProcessors/hardwareVersion';
import { processor as iccid } from './commandProcessors/iccid';
import { processor as internationalMobileSubscriberIdentity } from './commandProcessors/internationalMobileSubscriberIdentity';
import { processor as manufacturerIdentification } from './commandProcessors/manufacturerIdentification';
import { processor as modemDomainEventNotifications } from './commandProcessors/modemDomainEventNotification';
import { processor as modemParameters } from './commandProcessors/modemParameters';
import { processor as modemTraceActivation } from './commandProcessors/modemTraceActivation';
import { processor as modemUUID } from './commandProcessors/modemUUID';
import { processor as modeOfOperation } from './commandProcessors/modeOfOperation';
import { processor as networkRegistrationStatus } from './commandProcessors/networkRegistrationStatusNotification';
import { processor as networkTimeNotification } from './commandProcessors/networkTimeNotification';
import { processor as periodicTAU } from './commandProcessors/periodicTAU';
import { processor as pinCode } from './commandProcessors/pinCode';
import { processor as pinRetries } from './commandProcessors/pinRetries';
import { processor as powerSavingModeSettings } from './commandProcessors/powerSavingModeSettings';
import { processor as productSerialNumber } from './commandProcessors/productSerialNumberId';
import { processor as publicLandMobileNetwork } from './commandProcessors/publicLandMobileNetwork';
import { processor as revisionIdentification } from './commandProcessors/revisionIdentification';
import { processor as signalingConnectionStatus } from './commandProcessors/signalingConnectionStatusNotification';
import { processor as signalQualityNotification } from './commandProcessors/signalQualityNotification';
import { processor as systemMode } from './commandProcessors/systemMode';
import { processor as TXPowerReduction } from './commandProcessors/TXPowerReduction';
import { parseAT, ParsedPacket, RequestType } from './parseAT';

const processors = [
    publicLandMobileNetwork,
    activityStatus,
    connectivityStatistics,
    networkTimeNotification,
    currentBand,
    dataProfile,
    edrxdynamicparameters,
    evaluatingConnectionParameters,
    extendedSignalQuality,
    functionMode,
    hardwareVersion,
    iccid,
    internationalMobileSubscriberIdentity,
    manufacturerIdentification,
    modemDomainEventNotifications,
    modemParameters,
    modemTraceActivation,
    modemUUID,
    modeOfOperation,
    networkRegistrationStatus,
    periodicTAU,
    pinCode,
    pinRetries,
    powerSavingModeSettings,
    productSerialNumber,
    revisionIdentification,
    signalingConnectionStatus,
    signalQualityNotification,
    systemMode,
    TXPowerReduction,
] as const;

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

export default (packet: TraceEvent, state: State): State => {
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
            return processor.onRequest(parsedPacket, state);
        }
        return state;
    }

    // notification or response
    if (processor) {
        // response if true, otherwise a notification
        if (command === waitingAT) {
            waitingAT = '';
            return processor.onResponse(
                parsedPacket,
                state,
                getAndResetRequestType()
            );
        }

        return processor.onNotification
            ? processor.onNotification(parsedPacket, state)
            : processor.onResponse(parsedPacket, state);
    }

    // response without command
    const responseProcessor = processors.find(p => p.command === waitingAT);
    if (responseProcessor) {
        waitingAT = '';

        return responseProcessor.onResponse(
            parsedPacket,
            state,
            getAndResetRequestType()
        );
    }

    return state;
};

export type Processor<Command extends string> = {
    command: Command;
    documentation: string;
    initialState: () => Partial<State>;
    onResponse: (
        packet: ParsedPacket,
        state: State,
        requestType?: RequestType
    ) => State;
    onRequest?: (packet: ParsedPacket, state: State) => State;
    onNotification?: (packet: ParsedPacket, state: State) => State;
};

// Typescript challenge! Think it's related to the one above.
export const initialState = (): State =>
    processors.reduce(
        (state, processor) => ({ ...state, ...processor.initialState() }),
        {} as State
    );

type ProcessorCommands = typeof processors[number]['command'];

export type ATCommands = ProcessorCommands extends `${infer CMD}`
    ? `AT${CMD}`
    : never;

export const documentationMap = processors.reduce(
    (acc, { command, documentation }) =>
        Object.assign(acc, { [`AT${command}`]: documentation }),
    {} as Record<ATCommands, string>
);
