/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, CollapsibleGroup, selectedDevice } from 'pc-nrfconnect-shared';

import FlashSampleModal from '../../features/flashSample/FlashSampleModal';
import SourceSelector from '../../features/terminal/SourceSelector';
import { getUartSerialPort } from '../../features/tracing/traceSlice';
import { fullReport } from '../../features/tracingEvents/at/recommeneded';
import { sendAT } from '../../features/tracingEvents/at/sendCommand';

export default () => {
    const dispatch = useDispatch();
    const device = useSelector(selectedDevice);
    const serialPort = useSelector(getUartSerialPort);

    if (!device) return null;

    return (
        <CollapsibleGroup heading="Advanced Options" defaultCollapsed>
            <FlashSampleModal />
            {serialPort != null ? (
                <Button
                    className="w-100"
                    variant="secondary"
                    onClick={() => dispatch(sendAT(...fullReport))}
                    title={`Send AT commands over port ${serialPort.path}.\nRemember to start tracing in order to generate the report.`}
                >
                    Run Full Network Test
                </Button>
            ) : null}
            <SourceSelector />
        </CollapsibleGroup>
    );
};
