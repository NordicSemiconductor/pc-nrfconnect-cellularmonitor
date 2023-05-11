/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, usageData } from 'pc-nrfconnect-shared';

import { convertTraceFile } from '../../../features/tracing/nrfml';
import { getSerialPort } from '../../../features/tracing/traceSlice';
import { openInWireshark } from '../../../features/wireshark/wireshark';
import EventAction from '../../../usageDataActions';
import { askForTraceFile } from '../../../utils/fileUtils';

export default () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const hasSerialPort = useSelector(getSerialPort) != null;

    const loadTrace = async () => {
        const filePath = await askForTraceFile();
        if (filePath) {
            usageData.sendUsageData(EventAction.OPEN_TRACE_IN_WIRESHARK);
            await dispatch(convertTraceFile(filePath, setLoading));
            dispatch(
                openInWireshark(`${filePath.replace('.mtrace', '')}.pcapng`)
            );
        }
    };

    return (
        <Button
            className={`w-100 ${loading && 'active-animation'}`}
            onClick={loadTrace}
            disabled={loading || hasSerialPort}
            variant="secondary"
        >
            {loading === true
                ? 'Converting file to PCAP'
                : 'Open trace file in Wireshark...'}
        </Button>
    );
};
