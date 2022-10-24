/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Packet } from '.';

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

const removeStatusFromBody = (body: string): string => {
    const lineSeparator = /(?:\r\n|\\r\\n)/;

    const payloadArray = body.split(lineSeparator).filter(line => line);

    if (
        payloadArray.length &&
        validStatus.find(
            status => status === payloadArray[payloadArray.length - 1]
        )
    ) {
        return payloadArray.slice(0, -1).join();
    }
    return body;
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
        const payload = body ? removeStatusFromBody(body) : undefined;
        return {
            command,
            payload: payload ? payload : undefined,
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
