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

export default ({ onLiveTrace }: { onLiveTrace?: boolean }) => {
    const selectedWiresharkPath = useSelector(getWiresharkPath);
    const selectedTraceFormats = useSelector(getTraceFormats);
    const wiresharkPath = findWireshark(selectedWiresharkPath);

    if (wiresharkPath) return null;

    if (onLiveTrace && !selectedTraceFormats.includes('live')) {
        return null;
    }

    return (
        <div className="wireshark-warning">
            <span className="mdi mdi-alert mdi-24px wireshark-warning-icon" />
            <Wireshark />
        </div>
    );
};
