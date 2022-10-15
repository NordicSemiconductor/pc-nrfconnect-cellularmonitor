/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const getNumberList = (body?: string) => {
    const firstLine = body?.split('\r\n')[0];
    return (
        firstLine
            ?.trim()
            .split(',')
            .filter(item => item)
            .map(Number) ?? []
    );
};

export const getParametersFromResponse = (body?: string) => {
    if (!body) {
        return;
    }

    const lineSeparator = /(\r\n|\\r\\n)/;
    const firstLine = body?.split(lineSeparator)[0];
    const paramArray = firstLine
        .split(',')
        .map(stringValue => stringValue.trim())
        .map(value => {
            if (
                value.charAt(0) === '"' &&
                value.charAt(value.length - 1) === '"'
            ) {
                return value.substring(1, value.length - 1);
            }
            if (
                value.substring(0, 2) === '\\"' &&
                value.substring(value.length - 2) === '\\"'
            ) {
                return value.substring(2, value.length - 2);
            }
            return value;
        });

    return paramArray;
};
