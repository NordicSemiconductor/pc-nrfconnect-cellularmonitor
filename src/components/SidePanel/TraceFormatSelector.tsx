/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { Group } from 'pc-nrfconnect-shared';

import { TRACE_FORMATS, TraceFormat } from '../../features/tracing/traceFormat';
import { setTraceFormat as setStoredTraceFormat } from '../../utils/store';

interface TraceFormatSelectorProps {
    isTracing: boolean;
    selectedTraceFormat: TraceFormat;
    setSelectedTraceFormat: (format: TraceFormat) => void;
}

export default ({
    isTracing,
    selectedTraceFormat,
    setSelectedTraceFormat,
}: TraceFormatSelectorProps) => {
    const selectTraceFormat = (format: TraceFormat) => () => {
        setSelectedTraceFormat(format);
        setStoredTraceFormat(format);
    };

    return (
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
    );
};
