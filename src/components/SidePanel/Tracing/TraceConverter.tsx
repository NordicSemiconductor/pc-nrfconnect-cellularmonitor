/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'pc-nrfconnect-shared';

import { convertTraceFile } from '../../../features/tracing/nrfml';
import { askForTraceFile } from '../../../utils/fileUtils';

export default () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

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
            disabled={loading}
            variant="secondary"
        >
            {loading === true
                ? 'Converting file to PCAP'
                : 'Convert RAW trace to PCAP'}
        </Button>
    );
};
