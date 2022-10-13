/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// eslint-disable-next-line import/no-cycle
import { Packet } from '.';

interface parsedAT {
    command: string | undefined;
    operator: string | undefined;
    body: string | undefined;
    isRequest: boolean | undefined;
    lastLine: string | undefined;
    status: string | undefined;
}
const decoder = new TextDecoder('utf-8');
export const parseAT = (packet: Packet): parsedAT => {
    const textData = JSON.stringify(decoder.decode(packet.packet_data));
    const escapedData = textData.substring(1, textData.length - 1);
    const match = /(AT)?([+%][\w\d]+)?(=\?|[=?])?(.*)?/gi.exec(escapedData);
    if (match) {
        const [, startsWithAt, command, operator, body] = match;

        const lines = (body ?? '').split('\\r\\n').filter(line => line);

        const lastLine = lines.length > 1 ? lines.pop()?.trim() : undefined;
        const status = lastLine != null ? lastLine?.trim() : undefined;

        return {
            command,
            operator,
            body,
            isRequest: startsWithAt !== undefined,
            lastLine,
            status,
        };
    }
    return {
        command: undefined,
        operator: undefined,
        body: undefined,
        isRequest: undefined,
        lastLine: undefined,
        status: undefined,
    };
};
