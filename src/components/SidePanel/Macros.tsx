/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Button, SerialPort } from 'pc-nrfconnect-shared';

import { getUartSerialPort } from '../../features/tracing/traceSlice';
import {
    fullReport,
    recommendedAt,
    sendMacros,
} from '../../features/tracingEvents/at/recommeneded';

export const Macros = () => {
    const serialPort = useSelector(getUartSerialPort);

    if (serialPort != null) {
        return (
            <>
                <Button
                    className="w-100"
                    variant="secondary"
                    onClick={() => sendMacros(serialPort, recommendedAt)}
                    title={`Send recommended AT commands over port ${serialPort.path}.\nRemember to Start tracing, in order to update the dashboard and chart.`}
                >
                    Run recommended AT commands
                </Button>
                <Button
                    className="w-100"
                    variant="secondary"
                    onClick={() => sendMacros(serialPort, fullReport)}
                    title={`Send recommended AT commands over port ${serialPort.path}.\nRemember to Start tracing, in order to update the dashboard and chart.`}
                >
                    Run Full Network Test
                </Button>
            </>
        );
    }
    return null;
};
