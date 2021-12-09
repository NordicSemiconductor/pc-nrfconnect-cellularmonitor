/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';
import { getAppDataDir } from 'pc-nrfconnect-shared';

import { SourceFormat, TraceFormat } from './formats';

const fileExtension = (format: TraceFormat) => {
    switch (format) {
        case 'raw':
            return '.bin';
        case 'pcap':
            return '.pcapng';
        default:
            throw new Error(
                `Unknown format ${format} does not have associated file extension`
            );
    }
};

const extensionlessFilePath = (source: SourceFormat) => {
    if (source.type === 'file') {
        const basename = path.basename(source.path, '.bin');
        const directory = path.dirname(source.path);
        return path.join(directory, basename);
    }

    const filename = `trace-${source.startTime
        .toISOString()
        .replace(/:/g, '-')}`;
    return path.join(getAppDataDir(), filename);
};

export default (source: SourceFormat, format: TraceFormat) =>
    extensionlessFilePath(source) + fileExtension(format);