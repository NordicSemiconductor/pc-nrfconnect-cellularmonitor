/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toggle } from 'pc-nrfconnect-shared';

import { TraceFormat } from '../../../features/tracing/formats';
import {
    getIsTracing,
    getTraceFormats,
    setTraceFormats,
} from '../../../features/tracing/traceSlice';
import WiresharkWarning from '../../Wireshark/WiresharkWarning';

export default () => {
    const selectedFormats = useSelector(getTraceFormats);
    const isTracing = useSelector(getIsTracing);

    const dispatch = useDispatch();

    const toggle = (format: TraceFormat) => () => {
        const formats = selectedFormats.includes(format)
            ? selectedFormats.filter(f => f !== format)
            : [...selectedFormats, format];

        dispatch(setTraceFormats(formats));
    };

    return (
        <>
            <div className="d-flex justify-content-between">
                Open in Wireshark{' '}
                <Toggle
                    disabled={isTracing}
                    isToggled={selectedFormats.includes('live')}
                    onToggle={toggle('live')}
                />
            </div>

            <div className="d-flex justify-content-between">
                Save trace file to disk{' '}
                <Toggle
                    disabled={isTracing}
                    isToggled={selectedFormats.includes('raw')}
                    onToggle={toggle('raw')}
                />
            </div>

            <WiresharkWarning />
        </>
    );
};
