/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

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

export const sinkName = (format: TraceFormat) => {
    switch (format) {
        case 'raw':
            return 'nrfml-raw-file-sink';
        case 'pcap':
            return 'nrfml-pcap-sink';
        case 'live':
            return 'nrfml-wireshark-named-pipe-sink';
    }
};
