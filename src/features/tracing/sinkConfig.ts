/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Device } from 'pc-nrfconnect-shared';

import { RootState } from '../../reducers';
import { deviceInfo, selectedDevice } from '../../shouldBeInShared';
import { defaultWiresharkPath } from '../../utils/wireshark';
import { SourceFormat, TraceFormat } from './formats';
import sinkFile from './sinkFile';
import { getWiresharkPath } from './traceSlice';

const { displayName: appName } = require('../../../package.json');

const describeDevice = (device: Device) =>
    `${deviceInfo(device).name ?? 'unknown'} ${device?.boardVersion}`;

const additionalPcapProperties = (device?: Device) => ({
    os_name: process.platform,
    application_name: appName,
    hw_name: device != null ? describeDevice(device) : undefined,
});

export default (
    state: RootState,
    source: SourceFormat,
    format: TraceFormat
) => {
    if (format === 'raw') {
        return {
            name: 'nrfml-raw-file-sink',
            init_parameters: {
                file_path: sinkFile(source, format),
            },
        } as const;
    }

    if (format === 'pcap') {
        return {
            name: 'nrfml-pcap-sink',
            init_parameters: {
                file_path: sinkFile(source, format),
                ...additionalPcapProperties(selectedDevice(state)),
            },
        } as const;
    }

    if (format === 'live') {
        return {
            name: 'nrfml-wireshark-named-pipe-sink',
            init_parameters: {
                start_process:
                    getWiresharkPath(state) ??
                    defaultWiresharkPath() ??
                    'WIRESHARK NOT FOUND',
                ...additionalPcapProperties(selectedDevice(state)),
            },
        } as const;
    }

    throw new Error(
        `Unknown format ${format} does not have an associated sink config`
    );
};
