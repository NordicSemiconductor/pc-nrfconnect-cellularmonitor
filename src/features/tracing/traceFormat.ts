/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Device } from 'pc-nrfconnect-shared';

import { deviceInfo } from '../../shouldBeInShared';
import { defaultWiresharkPath } from '../../utils/wireshark';

const { displayName: appName } = require('../../../package.json');

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

const describeDevice = (device: Device) =>
    `${deviceInfo(device).name ?? 'unknown'} ${device?.boardVersion}`;

const additionalPcapProperties = (device?: Device) => ({
    os_name: process.platform,
    application_name: appName,
    hw_name: device != null ? describeDevice(device) : undefined,
});

export const sinkConfig = {
    raw: (filePath: string) =>
        ({
            name: 'nrfml-raw-file-sink',
            init_parameters: {
                file_path: filePath,
            },
        } as const),
    pcap: (filePath: string, device?: Device) =>
        ({
            name: 'nrfml-pcap-sink',
            init_parameters: {
                file_path: filePath,
                ...additionalPcapProperties(device),
            },
        } as const),
    live: (filePath: string, device?: Device) =>
        ({
            name: 'nrfml-wireshark-named-pipe-sink',
            init_parameters: {
                start_process: `"${defaultWiresharkPath()}"`,
                ...additionalPcapProperties(device),
            },
        } as const),
};

export const requiresTraceDb = (formats: TraceFormat[]) =>
    formats.includes('pcap') || formats.includes('live');
