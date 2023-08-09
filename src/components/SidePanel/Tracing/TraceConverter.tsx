/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, usageData } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { convertTraceFile } from '../../../features/tracing/nrfml';
import { isWiresharkInstalled } from '../../../features/wireshark/wireshark';
import EventAction from '../../../usageDataActions';
import { askForTraceFile } from '../../../utils/fileUtils';

export default () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const enabled = isWiresharkInstalled();
    const title = enabled ? undefined : 'Install wireshark to use this feature';

    const loadTrace = async () => {
        const filePath = await askForTraceFile();
        if (filePath) {
            usageData.sendUsageData(EventAction.OPEN_TRACE_IN_WIRESHARK);
            dispatch(convertTraceFile(filePath, setLoading));
        }
    };

    return (
        <Button
            className={`w-100 ${loading && 'active-animation'}`}
            onClick={loadTrace}
            disabled={loading || !enabled}
            variant="secondary"
            title={title}
        >
            {loading === true
                ? 'Converting file to PCAP'
                : 'Open trace file in Wireshark...'}
        </Button>
    );
};
