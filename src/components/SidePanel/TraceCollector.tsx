/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { useSelector } from 'react-redux';
import { Group } from 'pc-nrfconnect-shared';

import { TRACE_FORMATS, TraceFormat } from '../../features/tracing/traceFormat';
import { getIsTracing, getSerialPort } from '../../features/tracing/traceSlice';
import {
    getTraceFormat as getStoredTraceFormat,
    setTraceFormat as setStoredTraceFormat,
} from '../../utils/store';
import Serialports from './Serialports';
import StartStopTrace from './StartStopTrace';

export default () => {
    const isTracing = useSelector(getIsTracing);
    const [selectedTraceFormat, setSelectedTraceFormat] = useState<TraceFormat>(
        getStoredTraceFormat()
    );

    const selectedSerialPort = useSelector(getSerialPort);

    const selectTraceFormat = (format: TraceFormat) => () => {
        setSelectedTraceFormat(format);
        setStoredTraceFormat(format);
    };

    if (!selectedSerialPort) {
        return null;
    }

    return (
        <>
            <Serialports
                disabled={isTracing}
                selectedSerialPort={selectedSerialPort}
            />
            <Group heading="Trace output format">
                <ButtonGroup
                    className={`trace-selector w-100 ${
                        isTracing ? 'disabled' : ''
                    }`}
                >
                    {TRACE_FORMATS.map((format: TraceFormat) => (
                        <Button
                            // @ts-expect-error -- Doesn't seem to be an easy way to use custom variants with TS
                            variant={
                                format === selectedTraceFormat ? 'set' : 'unset'
                            }
                            onClick={selectTraceFormat(format)}
                            key={format}
                            disabled={isTracing}
                        >
                            {format}
                        </Button>
                    ))}
                </ButtonGroup>
            </Group>
            <StartStopTrace traceFormat={selectedTraceFormat} />
            <hr />
        </>
    );
};
