/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { TraceFormat } from '../../../features/tracing/formats';
import { findWireshark } from '../../../features/wireshark/wireshark';
import { getWiresharkPath } from '../../../features/wireshark/wiresharkSlice';
import Wireshark from '../../Dashboard/Wireshark';

interface WiresharkWarningProps {
    selectedTraceFormats: TraceFormat[];
}

export default ({ selectedTraceFormats }: WiresharkWarningProps) => {
    const selectedWiresharkPath = useSelector(getWiresharkPath);
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
