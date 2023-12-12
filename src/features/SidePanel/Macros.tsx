/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    selectedDevice,
    usageData,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import EventAction from '../../app/usageDataActions';
import { getTerminalSerialPort } from '../terminal/serialPortSlice';
import {
    getDetectedAtHostLibrary,
    getIsSendingATCommands,
    getIsTracing,
} from '../tracing/traceSlice';
import { fullReport, recommendedAt } from '../tracingEvents/at/recommeneded';
import { sendAT } from '../tracingEvents/at/sendCommand';

export const Recommended = () => (
    <Macro commands={recommendedAt} title="Refresh dashboard" />
);

export const FullNetworkReport = () => (
    <Macro commands={fullReport} title="Run full network test" />
);

type Macro = {
    commands: string[];
    title: string;
};

export const Macro = ({ commands, title }: Macro) => {
    const dispatch = useDispatch();
    const device = useSelector(selectedDevice);
    const serialPort = useSelector(getTerminalSerialPort);
    const detectedAtHostLibrary = useSelector(getDetectedAtHostLibrary);
    const isTracing = useSelector(getIsTracing);
    const isSending = useSelector(getIsSendingATCommands);

    if (device != null && serialPort != null) {
        return (
            <Button
                className="w-100"
                variant="secondary"
                onClick={() => {
                    usageData.sendUsageData(
                        EventAction.SEND_AT_COMMANDS_MACRO,
                        { type: title }
                    );
                    dispatch(sendAT(commands));
                }}
                title={
                    detectedAtHostLibrary
                        ? `Send a series of AT commands over ${serialPort.path}.\nRemember to click Start, in order to update the dashboard and chart.`
                        : `We could not detect AT host library on the connected device, for more information visit our documentation.`
                }
                disabled={!detectedAtHostLibrary || !isTracing || isSending}
            >
                {isSending ? 'Sending commands' : title}
            </Button>
        );
    }
    return null;
};
