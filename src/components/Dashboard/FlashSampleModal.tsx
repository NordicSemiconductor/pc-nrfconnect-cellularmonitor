/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useSelector } from 'react-redux';
import { Button, deviceInfo, selectedDevice } from 'pc-nrfconnect-shared';

import { flash, is91DK, isThingy91 } from './flashSample';

type Props = { visible: boolean; close: () => void };

export default ({ visible, close }: Props) => {
    const device = useSelector(selectedDevice);

    const [status, setStatus] = useState<(string | undefined)[]>([]);
    const onProgress = useCallback(
        (progress?: string) => setStatus(state => [...state, progress]),
        []
    );
    const deviceName = device
        ? device.nickname || deviceInfo(device).name
        : 'No device selected';

    const validDevice = device && (isThingy91(device) || is91DK(device));

    if (!visible) return null;

    return (
        <Modal show onHide={close} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{deviceName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Try nRF9160: Asset Tracker v2 (
                    <a
                        target="_blank"
                        href="https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/applications/asset_tracker_v2/README.html"
                        rel="noreferrer"
                    >
                        link
                    </a>
                    ) sample app too capture some live trace data.
                </p>
                <p>
                    Clicking the &ldquo;Flash device&rdquo; button will flash
                    your device with first the required modem (1.3.2) and the
                    hex file for the Asset tracker.
                </p>
                <ul>
                    {status.map(item => (
                        // eslint-disable-next-line react/jsx-key
                        <li>{item}</li>
                    ))}
                </ul>

                {!!device && !validDevice && (
                    <p>
                        Selected device does not have any available firmware
                        sample.
                    </p>
                )}
            </Modal.Body>
            <Modal.Footer>
                {!device && <em>Select a device to flash</em>}

                {!!device && validDevice && (
                    <Button onClick={() => flash(device, onProgress)}>
                        Flash device {deviceName}
                    </Button>
                )}
                <Button onClick={close}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};
