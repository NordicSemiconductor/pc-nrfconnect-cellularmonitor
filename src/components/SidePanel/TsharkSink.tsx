/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toggle } from 'pc-nrfconnect-shared';

import {
    getIsTracing,
    getTraceFormats,
    setTraceFormats,
} from '../../features/tracing/traceSlice';

export const AddTsharkSink = () => {
    const dispatch = useDispatch();
    const isTracing = useSelector(getIsTracing);
    const sinks = useSelector(getTraceFormats);
    const tsharkEnabled = sinks.includes('tshark');

    const toggleTshark = () => {
        if (tsharkEnabled) {
            dispatch(setTraceFormats(sinks.filter(sink => sink !== 'tshark')));
        } else {
            dispatch(setTraceFormats([...sinks, 'tshark']));
        }
    };

    return (
        <Toggle
            label="Analyze packets with tshark"
            title="This option makes traces slower, but adds more detail in the Dashboard. No information is lost if this option is disabled."
            isToggled={tsharkEnabled}
            onToggle={toggleTshark}
            disabled={isTracing}
        />
    );
};
