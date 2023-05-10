/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, usageData } from 'pc-nrfconnect-shared';

import { getUartSerialPort } from '../../features/tracing/traceSlice';
import {
    fullReport,
    recommendedAt,
} from '../../features/tracingEvents/at/recommeneded';
import { sendAT } from '../../features/tracingEvents/at/sendCommand';
import EventAction from '../../usageDataActions';

export const Recommended = () => (
    <Macro commands={recommendedAt} title="Run recommended AT commands" />
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
    const serialPort = useSelector(getUartSerialPort);
    const [isSending, setIsSending] = useState(false);

    if (serialPort != null) {
        return (
            <Button
                className="w-100"
                variant="secondary"
                onClick={async () => {
                    usageData.sendUsageData(
                        EventAction.SEND_AT_COMMANDS_MACRO,
                        title
                    );
                    setIsSending(true);
                    await dispatch(sendAT(commands));
                    setIsSending(false);
                }}
                title={`Send a series of AT commands over ${serialPort.path}.\nRemember to click Start, in order to update the dashboard and chart.`}
                disabled={isSending}
            >
                {isSending ? 'Sending commands' : title}
            </Button>
        );
    }
    return null;
};
