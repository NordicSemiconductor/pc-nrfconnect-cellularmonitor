/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const getStringNumberPair = (payload: string): [string, number] => {
    const payloadArray = payload.split(',').map(parseStringValue);
    return [payloadArray[0], parseInt(payloadArray[1], 10)];
};

export const getNumber = (payload: string): number =>
    parseInt(payload.trim(), 10);

export const getNumberArray = (payload: string): number[] =>
    payload
        .split(',')
        .map(val => val.replace(/[()]/g, ''))
        .map(value => parseInt(value, 10));

// export const getArrays = (payload: string): number[][] => {
//     const arrays = /\([\w\d\s,']+\)/gi.exec(payload);

//     return [];
// };

export const getParametersFromResponse = (payload?: string) => {
    if (!payload) {
        return [];
    }
    const lineSeparator = /(?:\r\n|\\r\\n)/;
    const lines = payload?.split(lineSeparator).filter(line => line);
    const paramArray = lines
        .map(line =>
            line
                .split(',')
                .map(stringValue => stringValue.trim())
                .map(value => value.replace(/[\\]+|["]|[”]/g, ''))
        )
        .flat();

    return paramArray;
};

export const parseStringValue = (value: string): string => {
    if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        return value.substring(1, value.length - 1);
    }
    if (
        value.substring(0, 2) === '\\"' &&
        value.substring(value.length - 2) === '\\"'
    ) {
        return value.substring(2, value.length - 2);
    }
    return value;
};
