/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const ALL_TRACE_FORMATS = ['raw', 'pcap'] as const;
export type TraceFormat = typeof ALL_TRACE_FORMATS[number];

export const fileExtension = (format: TraceFormat) =>
    format === 'pcap' ? '.pcapng' : '.bin';

export const sinkName = (format: TraceFormat) =>
    format === 'pcap' ? 'nrfml-pcap-sink' : 'nrfml-raw-file-sink';
