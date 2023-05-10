/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getTraceFormats } from '../tracing/traceSlice';
import { findWireshark } from './wireshark';
import Wireshark from './WiresharkButton';
import { getWiresharkPath } from './wiresharkSlice';

export default () => {
    const selectedWiresharkPath = useSelector(getWiresharkPath);
    const selectedTraceFormats = useSelector(getTraceFormats);
    const wiresharkPath = findWireshark(selectedWiresharkPath);

    const showWiresharkWarning =
        selectedTraceFormats.includes('live') && !wiresharkPath;
    if (!showWiresharkWarning) return null;

    return (
        <div className="wireshark-warning">
            <span className="mdi mdi-alert mdi-24px wireshark-warning-icon" />
            <Wireshark extendedDescription />
        </div>
    );
};
