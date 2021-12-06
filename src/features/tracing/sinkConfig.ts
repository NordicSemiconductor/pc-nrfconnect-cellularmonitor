/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Device } from 'pc-nrfconnect-shared';

import { deviceInfo } from '../../shouldBeInShared';
import { defaultWiresharkPath } from '../../utils/wireshark';
import { fileExtension, TraceFormat } from './formats';

const { displayName: appName } = require('../../../package.json');

const describeDevice = (device: Device) =>
    `${deviceInfo(device).name ?? 'unknown'} ${device?.boardVersion}`;

const additionalPcapProperties = (device?: Device) => ({
    os_name: process.platform,
    application_name: appName,
    hw_name: device != null ? describeDevice(device) : undefined,
});

export default (
    format: TraceFormat,
    extensionlessFilePath: string,
    device?: Device,
    wiresharkPath?: string | null
) => {
    if (format === 'raw') {
        return {
            name: 'nrfml-raw-file-sink',
            init_parameters: {
                file_path: extensionlessFilePath + fileExtension(format),
            },
        } as const;
    }

    if (format === 'pcap') {
        return {
            name: 'nrfml-pcap-sink',
            init_parameters: {
                file_path: extensionlessFilePath + fileExtension(format),
                ...additionalPcapProperties(device),
            },
        } as const;
    }

    if (format === 'live') {
        return {
            name: 'nrfml-wireshark-named-pipe-sink',
            init_parameters: {
                start_process: `${wiresharkPath ?? defaultWiresharkPath()}`,
                ...additionalPcapProperties(device),
            },
        } as const;
    }

    throw new Error(
        `Unknown format ${format} does not have an associated sink config`
    );
};
