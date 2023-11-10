/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dialog } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getDetectingTraceDb,
    setDetectingTraceDb,
} from '../../../features/tracing/traceSlice';

export default () => {
    const dispatch = useDispatch();
    const detectingTraceDb = useSelector(getDetectingTraceDb);

    if (!detectingTraceDb) return null;

    return (
        <Dialog
            isVisible
            size="lg"
            onHide={() => dispatch(setDetectingTraceDb(false))}
        >
            <Dialog.Header
                title="Detecting modem firmware version"
                showSpinner
            />
            <Dialog.Body>
                <p>
                    Starting trace and auto-detecting trace database for parsing
                    data. This might take some time.
                </p>
                <ul className="trace-db-dialog-list">
                    <li>
                        TIP! You can manually select a trace database in the
                        Trace Options section to skip this step.
                    </li>
                    <li>
                        TIP! Ensure that the correct serialport is selected, and
                        that the modem firmware on the device is one of the
                        supported firmwares.
                    </li>
                    <li>
                        TIP! Press the reset button on your development kit if
                        the process is taking a long time.
                    </li>
                </ul>
            </Dialog.Body>
            <Dialog.Footer>
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => dispatch(setDetectingTraceDb(false))}
                >
                    Close
                </Button>
            </Dialog.Footer>
        </Dialog>
    );
};
