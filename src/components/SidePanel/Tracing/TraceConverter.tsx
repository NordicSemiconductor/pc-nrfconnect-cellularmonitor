/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'pc-nrfconnect-shared';

import { convertTraceFile } from '../../../features/tracing/nrfml';
import { getIsTracing } from '../../../features/tracing/traceSlice';
import { askForTraceFile } from '../../../utils/fileUtils';

export default () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const isTracing = useSelector(getIsTracing);

    const loadTrace = () => {
        const file = askForTraceFile();
        if (file) {
            dispatch(convertTraceFile(file, setLoading));
        }
    };

    return (
        <Button
            className={`w-100 ${loading && 'active-animation'}`}
            onClick={loadTrace}
            disabled={loading || isTracing}
            variant="secondary"
        >
            {loading === true
                ? 'Converting file to PCAP'
                : 'Convert RAW trace to PCAP'}
        </Button>
    );
};
