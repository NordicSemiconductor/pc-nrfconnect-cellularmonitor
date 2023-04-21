/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'pc-nrfconnect-shared';

import { getUartSerialPort } from '../../features/tracing/traceSlice';
import { recommendedAt } from '../../features/tracingEvents/at/recommeneded';
import { sendAT } from '../../features/tracingEvents/at/sendCommand';

export const Macros = () => {
    const dispatch = useDispatch();
    const serialPort = useSelector(getUartSerialPort);

    if (serialPort != null) {
        return (
            <Button
                className="w-100"
                variant="secondary"
                onClick={() => dispatch(sendAT(recommendedAt))}
                title={`Send recommended AT commands over port ${serialPort.path}.\nRemember to Start tracing, in order to update the dashboard and chart.`}
            >
                Run recommended AT commands
            </Button>
        );
    }
    return null;
};
