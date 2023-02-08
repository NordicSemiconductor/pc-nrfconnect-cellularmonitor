/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Button,
    Card,
    deviceInfo,
    InfoDialog,
    logger,
    selectedDevice,
} from 'pc-nrfconnect-shared';

import { flash, is91DK } from './flashSample';
import { Sample, samples } from './samples';

import './FlashSampleModal.scss';

// import { flash, is91DK, isThingy91 } from './flashSample';

type Props = { visible: boolean; close: () => void };

export default ({ visible, close }: Props) => {
    const [selectedSample, setSelectedSample] = useState<Sample>();

    // const [status, setStatus] = useState<(string | undefined)[]>([]);
    // const onProgress = useCallback(
    //     (progress?: string) => setStatus(state => [...state, progress]),
    //     []
    // );

    // const validDevice = device && (isThingy91(device) || is91DK(device));

    if (!visible) return null;

    const title = `Program ${
        selectedSample ? selectedSample?.title : 'device'
    }`;

    return (
        <InfoDialog onClose={close} isVisible={visible} title={title}>
            {selectedSample ? (
                <ProgramSample sample={selectedSample} />
            ) : (
                <SelectSample selectSample={setSelectedSample} />
            )}
        </InfoDialog>
    );
};

const SelectSample = ({
    selectSample,
}: {
    selectSample: (sample: Sample) => void;
}) => {
    const device = useSelector(selectedDevice);
    const deviceName = device
        ? device.nickname || deviceInfo(device).name
        : 'No device selected';

    const selectedSamples = is91DK(device) ? samples.dk91 : samples.thingy91;

    return (
        <>
            <p>
                Make a selection to program the {deviceName} with a pre-compiled
                application and modem firmware.
            </p>
            <div className="installable-app-grid">
                {selectedSamples.map(sample => (
                    <Card key={sample.title} title={sample.title}>
                        {sample.description}
                        <Button
                            className="w-100"
                            onClick={() => {
                                selectSample(sample);
                            }}
                        >
                            Select
                        </Button>
                    </Card>
                ))}
            </div>
        </>
    );
};

const ProgramSample = ({ sample }: { sample: Sample }) => {
    const device = useSelector(selectedDevice);
    if (!device) return null;

    return (
        <>
            <p>This will program the following:</p>
            {sample.fw.map(f => (
                <div key={f.file}>
                    <strong>{f.type}</strong>
                    <br />
                    {f.file}
                </div>
            ))}
            <p className="text-muted mt-5" style={{ wordBreak: 'break-all' }}>
                Application download documentation: <br />
                <a
                    href="https://www.nordicsemi.com/Products/Development-hardware/nrf9160-dk"
                    target="_blank"
                    rel="noreferrer"
                >
                    https://www.nordicsemi.com/Products/Development-hardware/nrf9160-dk
                </a>
            </p>
            <p className="text-muted" style={{ wordBreak: 'break-all' }}>
                Application example documentation: <br />
                <a
                    href="https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/applications/asset_tracker_v2/README.html"
                    target="_blank"
                    rel="noreferrer"
                >
                    https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/applications/asset_tracker_v2/README.html
                </a>
            </p>

            <div className="mt-5">
                <Button
                    onClick={() =>
                        flash(device, sample, progress => logger.info(progress))
                    }
                >
                    Program
                </Button>
            </div>
        </>
    );
};

// <Modal show onHide={close} size="lg">
//     <Modal.Header closeButton>
//         <Modal.Title>{deviceName}</Modal.Title>
//     </Modal.Header>
//     <Modal.Body>
//         <p>
//             Try nRF9160: Asset Tracker v2 (
//             <a
//                 target="_blank"
//                 href="https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/applications/asset_tracker_v2/README.html"
//                 rel="noreferrer"
//             >
//                 link
//             </a>
//             ) sample app too capture some live trace data.
//         </p>
//         <p>
//             Clicking the &ldquo;Flash device&rdquo; button will flash
//             your device with first the required modem (1.3.2) and the
//             hex file for the Asset tracker.
//         </p>
//         <ul>
//             {status.map(item => (
//                 // eslint-disable-next-line react/jsx-key
//                 <li>{item}</li>
//             ))}
//         </ul>

//         {!!device && !validDevice && (
//             <p>
//                 Selected device does not have any available firmware
//                 sample.
//             </p>
//         )}
//     </Modal.Body>
//     <Modal.Footer>
//         {!device && <em>Select a device to flash</em>}

//         {!!device && validDevice && (
//             <Button className='w-100' onClick={() => flash(device, onProgress)}>
//                 Flash device {deviceName}
//             </Button>
//         )}
//         <Button onClick={close}>Close</Button>
//     </Modal.Footer>
// </Modal>
