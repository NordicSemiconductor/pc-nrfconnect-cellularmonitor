/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type Device,
    deviceInfo,
    selectedDevice,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { displayName as appName } from '../../../package.json';
import type { RootState } from '../../app/appReducer';
import { defaultSharkPath } from '../wireshark/wireshark';
import { getWiresharkPath } from '../wireshark/wiresharkSlice';
import { type SourceFormat, type TraceFormat } from './formats';
import sinkFile from './sinkFile';

const describeDevice = (device: Device) =>
    `${deviceInfo(device).name ?? 'unknown'} ${device?.devkit?.boardVersion}`;

const additionalPcapProperties = (device?: Device) => ({
    os_name: process.platform,
    application_name: appName,
    hw_name: device != null ? describeDevice(device) : undefined,
});

export default (
    state: RootState,
    source: SourceFormat,
    format: TraceFormat,
) => {
    if (format === 'raw') {
        // RawFileInitParameters
        return {
            file_path: sinkFile(source, format),
        };
    }

    if (format === 'pcap') {
        // PcapInitParameters
        return {
            file_path: sinkFile(source, format),
            ...additionalPcapProperties(selectedDevice(state)),
        };
    }

    if (format === 'live') {
        // WiresharkNamedPipeInitParameters
        return {
            start_process:
                getWiresharkPath(state) ??
                defaultSharkPath() ??
                'WIRESHARK NOT FOUND',
            ...additionalPcapProperties(selectedDevice(state)),
        };
    }

    throw new Error(
        `Unknown format ${format} does not have an associated sink config`,
    );
};
