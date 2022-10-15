/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Packet, ParsedPacket } from '.';
import { RequestType } from './utils';

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

const decoder = new TextDecoder('utf-8');
export const parseAT = (packet: Packet): ParsedPacket => {
    const textData = JSON.stringify(decoder.decode(packet.packet_data));
    const escapedData = textData.substring(1, textData.length - 1);
    const match = /(AT)?([+%][A-Z\d]+)?(=\?|[=?])?:?\s?(.*)?/gi.exec(
        escapedData
    );
    if (match) {
        const [, startsWithAt, command, operator, body] = match;

        const lines = (body ?? '').split('\\r\\n').filter(line => line);

        const lastLine = lines.length > 1 ? lines.pop()?.trim() : undefined;
        const status =
            (lastLine != null ? lastLine?.trim() : undefined) ||
            (body && body.startsWith('OK') ? 'OK' : undefined);

        return {
            command,
            body,
            requestType: startsWithAt
                ? operatorToRequestType(operator)
                : RequestType.NOT_A_REQUEST,
            lastLine,
            status,
        };
    }
    return {
        command: undefined,
        body: undefined,
        requestType: undefined,
        lastLine: undefined,
        status: undefined,
    };
};
