/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Device } from 'pc-nrfconnect-shared';

import { deviceInfo } from '../../shouldBeInShared';
import EventAction from '../../usageDataActions';
import { defaultWiresharkPath } from '../../utils/wireshark';

const { displayName: appName } = require('../../../package.json');

export const ALL_TRACE_FORMATS = ['raw', 'pcap', 'live'] as const;
export type TraceFormat = typeof ALL_TRACE_FORMATS[number];

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

export const sinkEvent = (format: TraceFormat) =>
    ({
        raw: EventAction.RAW_TRACE,
        pcap: EventAction.PCAP_TRACE,
        live: EventAction.LIVE_TRACE,
    }[format] ?? EventAction.UNKNOWN_TRACE);

const describeDevice = (device: Device) =>
    `${deviceInfo(device).name ?? 'unknown'} ${device?.boardVersion}`;

const additionalPcapProperties = (device?: Device) => ({
    os_name: process.platform,
    application_name: appName,
    hw_name: device != null ? describeDevice(device) : undefined,
});

export const sinkConfig = {
    raw: (extensionlessFilePath: string) =>
        ({
            name: 'nrfml-raw-file-sink',
            init_parameters: {
                file_path: extensionlessFilePath + fileExtension('raw'),
            },
        } as const),
    pcap: (extensionlessFilePath: string, device?: Device) =>
        ({
            name: 'nrfml-pcap-sink',
            init_parameters: {
                file_path: extensionlessFilePath + fileExtension('pcap'),
                ...additionalPcapProperties(device),
            },
        } as const),
    live: (
        _extensionlessFilePath: string,
        device?: Device,
        wiresharkPath?: string | null
    ) =>
        ({
            name: 'nrfml-wireshark-named-pipe-sink',
            init_parameters: {
                start_process: `${wiresharkPath ?? defaultWiresharkPath()}`,
                ...additionalPcapProperties(device),
            },
        } as const),
};

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
