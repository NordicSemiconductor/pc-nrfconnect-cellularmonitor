/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'pc-nrfconnect-shared';

import {
    getDetectingTraceDb,
    setDetectingTraceDb,
} from '../../../features/tracing/traceSlice';

export default () => {
    const dispatch = useDispatch();
    const detectingTraceDb = useSelector(getDetectingTraceDb);

    if (!detectingTraceDb) return null;

    return (
        <Modal
            show={detectingTraceDb}
            backdrop="static"
            size="lg"
            onHide={() => dispatch(setDetectingTraceDb(false))}
        >
            <Modal.Header closeButton>
                <Modal.Title data-testid="title">
                    <h4>Detecting modem firmware version</h4>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Starting trace and auto-detecting trace database for parsing
                    data. This might take some time.
                </p>
                <ul className="trace-db-dialog-list">
                    <li>
                        TIP! You can manually select a trace database in the
                        Advanced Options section to skip this step.
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
            </Modal.Body>
            <Modal.Footer>
                <Spinner />
                &nbsp;
                <Button
                    variant="secondary"
                    onClick={() => dispatch(setDetectingTraceDb(false))}
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
