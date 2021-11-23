/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { useSelector } from 'react-redux';
import { Group } from 'pc-nrfconnect-shared';

import {
    ALL_TRACE_FORMATS,
    TraceFormat,
} from '../../../features/tracing/sinks';
import { getWiresharkPath } from '../../../features/tracing/traceSlice';
import { setTraceFormats as setStoredTraceFormats } from '../../../utils/store';
import { findWireshark } from '../../../utils/wireshark';
import Wireshark from '../../Dashboard/Wireshark';

interface TraceFormatSelectorProps {
    isTracing: boolean;
    selectedTraceFormats: TraceFormat[];
    setSelectedTraceFormats: (formats: TraceFormat[]) => void;
}

export default ({
    isTracing,
    selectedTraceFormats = [],
    setSelectedTraceFormats,
}: TraceFormatSelectorProps) => {
    const selectedWiresharkPath = useSelector(getWiresharkPath);
    const wiresharkPath = findWireshark(selectedWiresharkPath);

    const selectTraceFormat = (format: TraceFormat) => () => {
        let newFormats;
        if (selectedTraceFormats.includes(format)) {
            newFormats = selectedTraceFormats.filter(f => f !== format);
        } else {
            newFormats = [...selectedTraceFormats, format];
        }
        setSelectedTraceFormats(newFormats);
        setStoredTraceFormats(newFormats);
    };

    const showWiresharkWarning =
        selectedTraceFormats.includes('live') && !wiresharkPath;

    return (
        <Group heading="Trace output format">
            <ButtonGroup
                className={`trace-selector w-100 ${
                    isTracing ? 'disabled' : ''
                }`}
            >
                {ALL_TRACE_FORMATS.map((format: TraceFormat) => (
                    <Button
                        // @ts-expect-error -- Doesn't seem to be an easy way to use custom variants with TS
                        variant={
                            selectedTraceFormats.includes(format)
                                ? 'set'
                                : 'unset'
                        }
                        onClick={selectTraceFormat(format)}
                        key={format}
                        disabled={isTracing}
                    >
                        {format}
                    </Button>
                ))}
            </ButtonGroup>
            {showWiresharkWarning && (
                <div className="text-danger warning-box">
                    <p>
                        LIVE tracing is selected, but no Wireshark installation
                        found. LIVE tracing will not work.
                    </p>
                    <Wireshark />
                </div>
            )}
        </Group>
    );
};
