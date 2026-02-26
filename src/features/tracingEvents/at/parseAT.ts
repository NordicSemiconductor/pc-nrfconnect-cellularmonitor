/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TraceEvent } from '../../tracing/tracePacketEvents';
import { getGlobalLineModeDelimiter } from './detectLineEnding';
import { lineSeparator } from './utils';

export enum RequestType {
    NOT_A_REQUEST,
    SET,
    SET_WITH_VALUE,
    READ,
    TEST,
}

const validStatus = ['OK', 'ERROR', '+CME ERROR', '+CMS ERROR'] as const;
export interface ParsedPacket {
    command?: string;
    requestType?: RequestType;
    payload: string | undefined;
    status?: (typeof validStatus)[number];
}

const operatorToRequestType = (operator?: string) => {
    if (!operator) return RequestType.SET;
    switch (operator) {
        case '=':
            return RequestType.SET_WITH_VALUE;
        case '?':
            return RequestType.READ;
        case '=?':
            return RequestType.TEST;
        default:
            return RequestType.NOT_A_REQUEST;
    }
};

const getStatus = (body?: string) => {
    const delimiter = getGlobalLineModeDelimiter();

    const lastLine = body
        ?.split(delimiter) // was "\\r\\n"
        .filter(line => line)
        .pop()
        ?.trim();

    return validStatus.find(status => lastLine === status);
};

const removeStatusFromBody = (body: string): string => {
    const payloadArray = body.split(lineSeparator).filter(line => line);

    if (
        payloadArray.length &&
        validStatus.find(
            status => status === payloadArray[payloadArray.length - 1],
        )
    ) {
        const delimiter = getGlobalLineModeDelimiter();
        return payloadArray.slice(0, -1).join(delimiter);
    }
    return body;
};

const decoder = new TextDecoder('utf-8');
export const parseAT = (packet: TraceEvent): ParsedPacket => {
    const textData = decoder.decode(packet.data);

    const match = /(AT)?([+%][A-Z\d]+)?(=\?|[=?])?:?\s?(.*)?/gis.exec(textData);
    if (match) {
        const [, startsWithAt, command, operator, body] = match;
        const status = getStatus(body?.trim());
        const payload = body ? removeStatusFromBody(body) : undefined;
        return {
            command: command != null ? command.toUpperCase() : command,
            payload: payload || undefined,
            requestType: startsWithAt
                ? operatorToRequestType(operator)
                : RequestType.NOT_A_REQUEST,
            status,
        };
    }
    return {
        command: undefined,
        payload: undefined,
        requestType: undefined,
        status: undefined,
    };
};
