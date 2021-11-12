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

import { stopTrace } from '../../features/tracing/nrfml';
import {
    getDetectingTraceDb,
    getTaskId,
    setDetectingTraceDb,
} from '../../features/tracing/traceSlice';

export default () => {
    const dispatch = useDispatch();
    const nrfmlTaskId = useSelector(getTaskId);
    const detectingTraceDb = useSelector(getDetectingTraceDb);

    return (
        <Modal
            show={detectingTraceDb}
            onHide={() => {
                dispatch(setDetectingTraceDb(false));
            }}
            backdrop="static"
            size="lg"
        >
            <Modal.Header closeButton>
                <Modal.Title data-testid="title">
                    <h3>Detecting modem fw version</h3>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Starting trace and auto-detecting trace database for parsing
                    data. This usually takes a few seconds.
                </p>
                <ul className="trace-db-dialog-list">
                    <li>
                        TIP! You can manually select a trace database to speed
                        up the process.
                    </li>
                    <li>
                        TIP! Press the reset button on your development kit if
                        the process hangs.
                    </li>
                </ul>
            </Modal.Body>
            <Modal.Footer>
                <Spinner />
                &nbsp;
                <Button
                    variant="outline-primary"
                    onClick={() => {
                        dispatch(stopTrace(nrfmlTaskId));
                        dispatch(setDetectingTraceDb(false));
                    }}
                >
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
