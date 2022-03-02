/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    PcapInitParameters,
    RawFileInitParameters,
    TsharkInitParameters,
    WiresharkNamedPipeInitParameters,
} from '@nordicsemiconductor/nrf-monitor-lib-js';
import { Device, deviceInfo, selectedDevice } from 'pc-nrfconnect-shared';

import { RootState } from '../../appReducer';
import { defaultSharkPath } from '../wireshark/wireshark';
import { getTsharkPath, getWiresharkPath } from '../wireshark/wiresharkSlice';
import { SourceFormat, TraceFormat } from './formats';
import sinkFile from './sinkFile';

const { displayName: appName } = require('../../../package.json');

const describeDevice = (device: Device) =>
    `${deviceInfo(device).name ?? 'unknown'} ${device?.boardVersion}`;

const additionalPcapProperties = (device?: Device) => ({
    os_name: process.platform,
    application_name: appName,
    hw_name: device != null ? describeDevice(device) : undefined,
});

type InitParameters =
    | RawFileInitParameters
    | PcapInitParameters
    | WiresharkNamedPipeInitParameters
    | TsharkInitParameters;

export default (
    state: RootState,
    source: SourceFormat,
    format: TraceFormat
): InitParameters => {
    if (format === 'raw') {
        // RawFileInitParameters
        return {
            name: 'nrfml-raw-file-sink',
            init_parameters: {
                file_path: sinkFile(source, format),
            },
        };
    }

    if (format === 'pcap') {
        // PcapInitParameters
        return {
            name: 'nrfml-pcap-sink',
            init_parameters: {
                file_path: sinkFile(source, format),
                ...additionalPcapProperties(selectedDevice(state)),
            },
        };
    }

    if (format === 'live') {
        // WiresharkNamedPipeInitParameters
        return {
            name: 'nrfml-wireshark-named-pipe-sink',
            init_parameters: {
                start_process:
                    getWiresharkPath(state) ??
                    defaultSharkPath('wireshark') ??
                    'WIRESHARK NOT FOUND',
                ...additionalPcapProperties(selectedDevice(state)),
            },
        };
    }

    if (format === 'opp') {
        // <TsharkInitParameters>
        return {
            name: 'nrfml-tshark-sink',
            init_parameters: {
                opp_json_object_key: 'onlinePowerProfiler',
                tshark_directory: getTsharkPath(state) ?? undefined,
                sleep: true,
            },
        };
    }

    throw new Error(
        `Unknown format ${format} does not have an associated sink config`
    );
};
