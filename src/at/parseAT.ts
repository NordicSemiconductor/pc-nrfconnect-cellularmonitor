/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Packet } from '.';
import { getParametersFromResponse } from './utils';

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
    body: string[];
    status?: typeof validStatus[number];
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
    const lastLine = body
        ?.split('\\r\\n')
        .filter(line => line)
        .pop()
        ?.trim();

    return validStatus.find(status => lastLine === status);
};

const decoder = new TextDecoder('utf-8');
export const parseAT = (packet: Packet): ParsedPacket => {
    const textData = JSON.stringify(decoder.decode(packet.packet_data));
    const escapedData = textData.substring(1, textData.length - 1);
    const match = /(AT)?([+%][A-Z\d]+)?(=\?|[=?])?:?\s?(.*)?/gi.exec(
        escapedData
    );
    if (match) {
        const [, startsWithAt, command, operator, body] = match;
        const status = getStatus(body);

        return {
            command,
            body: getParametersFromResponse(body, status),
            requestType: startsWithAt
                ? operatorToRequestType(operator)
                : RequestType.NOT_A_REQUEST,
            status,
        };
    }
    return {
        command: undefined,
        body: [],
        requestType: undefined,
        status: undefined,
    };
};
