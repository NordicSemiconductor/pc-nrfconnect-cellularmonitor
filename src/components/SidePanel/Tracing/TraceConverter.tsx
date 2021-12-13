/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch, useSelector } from 'react-redux';

import { convertTraceFile } from '../../../features/tracing/nrfml';
import { getSerialPort } from '../../../features/tracing/traceSlice';
import { askForTraceFile } from '../../../utils/fileUtils';

export default () => {
    const selectedSerialPort = useSelector(getSerialPort);

    if (selectedSerialPort) {
        return null;
    }

    const dispatch = useDispatch();

    const loadTrace = () => {
        const file = askForTraceFile();
        if (file) {
            dispatch(convertTraceFile(file));
        }
    };

    return (
        <Button
            className="w-100 secondary-btn"
            variant="secondary"
            onClick={loadTrace}
        >
            Convert RAW trace to PCAP
        </Button>
    );
};
