/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useSelector } from 'react-redux';
import { shell } from 'electron';
import { basename, dirname } from 'path';
import {
    Button,
    Card,
    deviceInfo,
    Dialog,
    DialogButton,
    logger,
    selectedDevice,
    Spinner,
} from 'pc-nrfconnect-shared';

import { flash, is91DK, isThingy91, SampleProgress } from './flashSample';
import { Sample, samples } from './samples';

import './FlashSampleModal.scss';

export default () => {
    const [selectedSample, setSelectedSample] = useState<Sample>();

    const [modalVisible, setModalVisible] = useState(false);
    const device = useSelector(selectedDevice);
    const compatible = device && (isThingy91(device) || is91DK(device));

    const close = useCallback(() => {
        setModalVisible(false);
        setSelectedSample(undefined);
    }, []);

    const title = `Program ${
        selectedSample ? selectedSample?.title : 'device'
    }`;

    return (
        <>
            {compatible && (
                <Button
                    className="w-100"
                    onClick={() => setModalVisible(!modalVisible)}
                >
                    Program device
                </Button>
            )}
            <Dialog isVisible={modalVisible} closeOnUnfocus onHide={close}>
                <Dialog.Header title={title} />
                <Dialog.Body>
                    {selectedSample ? (
                        <ProgramSample sample={selectedSample} close={close} />
                    ) : (
                        <SelectSample
                            selectSample={setSelectedSample}
                            close={close}
                        />
                    )}
                </Dialog.Body>
            </Dialog>
        </>
    );
};

const SelectSample = ({
    selectSample,
    close,
}: {
    selectSample: (sample: Sample) => void;
    close: () => void;
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
            <Dialog.Footer>
                <DialogButton onClick={close}>Close</DialogButton>
            </Dialog.Footer>
        </>
    );
};

const ProgramSample = ({
    sample,
    close,
}: {
    sample: Sample;
    close: () => void;
}) => {
    const device = useSelector(selectedDevice);

    const [progress, setProgress] = useState(
        new Map(sample.fw.map(fw => [fw, 0]))
    );

    const [isProgramming, setIsProgramming] = useState(false);

    const progressCb = useCallback(
        ({ progressJson: json, fw }: SampleProgress) => {
            logger.info(
                `${json.step}/${json.amountOfSteps}: ${json.progressPercentage}% - ${json.message}`
            );
            const amountOfProgress =
                ((json.step - 1) / json.amountOfSteps) * 100 +
                (1 / json.amountOfSteps) * json.progressPercentage;

            progress.set(fw, amountOfProgress);
            setProgress(new Map(progress.entries()));
        },
        [progress]
    );

    if (!device) return null;
    const isMcuBoot = isThingy91(device);

    return (
        <>
            <p>This will program the following:</p>
            {isMcuBoot && (
                <p>
                    Remember to put the device in MCUBoot mode. Press down the
                    center black button on the device while powering on.
                </p>
            )}
            {sample.fw.map(fw => (
                <div key={fw.file} className="mb-4">
                    <strong>{fw.type}</strong>
                    <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => shell.openPath(dirname(fw.file))}
                    >
                        {basename(fw.file)}
                    </button>
                    <ProgressBar
                        now={progress.get(fw)}
                        style={{ height: '4px' }}
                    />
                </div>
            ))}

            <p className="text-muted mb-4" style={{ wordBreak: 'break-all' }}>
                Application download documentation: <br />
                <a
                    href="https://www.nordicsemi.com/Products/Development-hardware/nrf9160-dk"
                    target="_blank"
                    rel="noreferrer"
                >
                    https://www.nordicsemi.com/Products/Development-hardware/nrf9160-dk
                </a>
            </p>

            <p className="text-muted mb-4" style={{ wordBreak: 'break-all' }}>
                Application example documentation: <br />
                <a
                    href="https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/applications/asset_tracker_v2/README.html"
                    target="_blank"
                    rel="noreferrer"
                >
                    https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/applications/asset_tracker_v2/README.html
                </a>
            </p>

            <div className="d-flex justify-content-end">
                {isProgramming && <Spinner />}

                <Button
                    onClick={close}
                    large
                    disabled={isProgramming}
                    className="mr-3"
                >
                    Close
                </Button>
                <Button
                    className="btn btn-primary"
                    large
                    disabled={isProgramming}
                    onClick={async () => {
                        setIsProgramming(true);
                        await flash(device, sample, progressCb);
                        setIsProgramming(false);
                    }}
                >
                    Program
                </Button>
            </div>
        </>
    );
};
