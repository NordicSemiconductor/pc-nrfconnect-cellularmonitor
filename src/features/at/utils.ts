/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const getParametersFromResponse = (body?: string, status?: string) => {
    if (!body) {
        return [];
    }

    const lineSeparator = /(?:\r\n|\\r\\n)/;

    let lines = body?.split(lineSeparator).filter(line => line);
    lines = lines[lines.length - 1] === status ? lines.slice(0, -1) : lines;
    const paramArray = lines
        .map(line =>
            line
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
                })
        )
        .flat();

    return paramArray;
};
