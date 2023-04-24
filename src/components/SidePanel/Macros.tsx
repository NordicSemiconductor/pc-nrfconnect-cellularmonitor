/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'pc-nrfconnect-shared';

import { getUartSerialPort } from '../../features/tracing/traceSlice';
import { recommendedAt } from '../../features/tracingEvents/at/recommeneded';
import { sendAT } from '../../features/tracingEvents/at/sendCommand';

export const Macros = () => {
    const dispatch = useDispatch();
    const serialPort = useSelector(getUartSerialPort);
    const [isSending, setIsSending] = useState(false);

    const onComplete = () => {
        setIsSending(false);
    };

    if (serialPort != null) {
        return (
            <Button
                className="w-100"
                variant="secondary"
                onClick={() => {
                    setIsSending(true);
                    dispatch(sendAT(recommendedAt, onComplete));
                }}
                title={`Send recommended AT commands over port ${serialPort.path}.\nRemember to Start tracing, in order to update the dashboard and chart.`}
                disabled={isSending}
            >
                {isSending
                    ? 'Sending commands'
                    : 'Send recommended AT commands'}
            </Button>
        );
    }
    return null;
};
