/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventAction from '../../usageDataActions';

export const ALL_TRACE_FORMATS = ['raw', 'pcap', 'live'] as const;
export type TraceFormat = typeof ALL_TRACE_FORMATS[number];

export const fileExtension = (format: TraceFormat) => {
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

export const sinkEvent = (format: TraceFormat) =>
    ({
        raw: EventAction.RAW_TRACE,
        pcap: EventAction.PCAP_TRACE,
        live: EventAction.LIVE_TRACE,
    }[format] ?? EventAction.UNKNOWN_TRACE);

export const progressConfig = (
    format: TraceFormat,
    extensionlessFilePath: string
) => ({
    format,
    path:
        format === 'live' ? '' : extensionlessFilePath + fileExtension(format),
});

export const requiresTraceDb = (formats: TraceFormat[]) =>
    formats.includes('pcap') || formats.includes('live');