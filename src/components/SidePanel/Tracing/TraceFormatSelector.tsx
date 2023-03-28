/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'pc-nrfconnect-shared';

import {
    ALL_TRACE_FORMATS,
    TraceFormat,
} from '../../../features/tracing/formats';
import {
    getTraceFormats,
    setTraceFormats,
} from '../../../features/tracing/traceSlice';
import WiresharkWarning from '../../Wireshark/WiresharkWarning';

interface TraceFormatSelectorProps {
    isTracing: boolean;
}

export default ({ isTracing }: TraceFormatSelectorProps) => {
    const selectedFormats = useSelector(getTraceFormats);
    const dispatch = useDispatch();
    const selectTraceFormat = (format: TraceFormat) => () => {
        const newFormats = selectedFormats.includes(format)
            ? selectedFormats.filter(f => f !== format)
            : [...selectedFormats, format];

        dispatch(setTraceFormats(newFormats));
    };

    return (
        <>
            <p>Trace outputs</p>

            <ButtonGroup
                className={`trace-selector w-100 ${
                    isTracing ? 'disabled' : ''
                }`}
            >
                {ALL_TRACE_FORMATS.filter(
                    (format: TraceFormat) => format !== 'tshark'
                ).map((format: TraceFormat) => (
                    <Button
                        variant="custom"
                        className={
                            selectedFormats.includes(format) ? 'set' : 'unset'
                        }
                        onClick={selectTraceFormat(format)}
                        key={format}
                        disabled={isTracing}
                    >
                        {format}
                    </Button>
                ))}
            </ButtonGroup>
            <WiresharkWarning />
        </>
    );
};
