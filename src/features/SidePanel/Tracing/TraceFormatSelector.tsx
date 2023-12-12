/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toggle, usageData } from '@nordicsemiconductor/pc-nrfconnect-shared';

import EventAction from '../../../app/usageDataActions';
import { TraceFormat } from '../../tracing/formats';
import {
    getIsTracing,
    getTraceFormats,
    setTraceFormats,
} from '../../tracing/traceSlice';
import WiresharkWarning from '../../wireshark/WiresharkWarning';

export default () => {
    const selectedFormats = useSelector(getTraceFormats);
    const isTracing = useSelector(getIsTracing);

    const dispatch = useDispatch();

    const toggle = (format: TraceFormat) => () => {
        usageData.sendUsageData(EventAction.TOGGLE_SAVE_TRACE_TO_FILE);
        const formats = selectedFormats.includes(format)
            ? selectedFormats.filter(f => f !== format)
            : [...selectedFormats, format];

        dispatch(setTraceFormats(formats));
    };

    return (
        <>
            <Toggle
                label="Open in Wireshark"
                disabled={isTracing}
                isToggled={selectedFormats.includes('live')}
                onToggle={toggle('live')}
            />
            <Toggle
                label="Save trace file to disk"
                disabled={isTracing}
                isToggled={selectedFormats.includes('raw')}
                onToggle={toggle('raw')}
            />
            <WiresharkWarning onLiveTrace />
        </>
    );
};
