/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useSelector } from 'react-redux';
import { shell } from 'electron';
import { basename, dirname } from 'path';
import {
    Alert,
    Button,
    deviceInfo,
    Dialog,
    DialogButton,
    logger,
    selectedDevice,
    Spinner,
} from 'pc-nrfconnect-shared';

import { flash, is91DK, isThingy91, SampleProgress } from './flashSample';
import {
    downloadedFilePath,
    downloadSample,
    downloadSampleIndex,
    initialSamples,
    Sample,
} from './samples';

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
                {selectedSample ? (
                    <ProgramSample
                        sample={selectedSample}
                        selectSample={setSelectedSample}
                        close={close}
                    />
                ) : (
                    <SelectSample
                        selectSample={setSelectedSample}
                        close={close}
                    />
                )}
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
    const [samples, setSamples] = useState(initialSamples);

    useEffect(() => {
        downloadSampleIndex.then(setSamples);
    }, []);

    const deviceName = device
        ? device.nickname || deviceInfo(device).name
        : 'No device selected';

    const selectedSamples = is91DK(device) ? samples.dk91 : samples.thingy91;

    return (
        <>
            <Dialog.Header title="Flash sample app" />
            <Dialog.Body>
                <p>
                    Make a selection to program the {deviceName} with a
                    pre-compiled application and modem firmware.
                </p>
                <div className="installable-app-grid">
                    {selectedSamples.map(sample => (
                        <div
                            key={sample.title}
                            className="card-in-card p-3 d-flex flex-column"
                        >
                            <strong className="d-block">{sample.title}</strong>
                            <p className="flex-grow-1 py-2">
                                {sample.description}
                            </p>
                            <Button
                                className="w-100"
                                onClick={() => {
                                    selectSample(sample);
                                }}
                            >
                                Select
                            </Button>
                        </div>
                    ))}
                </div>
            </Dialog.Body>

            <Dialog.Footer>
                <DialogButton onClick={close}>Close</DialogButton>
            </Dialog.Footer>
        </>
    );
};

const ProgramSample = ({
    sample,
    selectSample,
    close,
}: {
    sample: Sample;
    selectSample: (sample?: Sample) => void;
    close: () => void;
}) => {
    const device = useSelector(selectedDevice);

    const [progress, setProgress] = useState(
        new Map(sample.fw.map(fw => [fw, 0]))
    );

    const [isProgramming, setIsProgramming] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();

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

    if (!device) return <WaitingForReconnect />;
    const isMcuBoot = isThingy91(device);

    return (
        <>
            <Dialog.Header title={`Program ${sample.title}`} />
            <Dialog.Body>
                <p>This will program the following:</p>
                {isMcuBoot && (
                    <p>
                        Remember to put the device in MCUBoot mode. Press down
                        the center black button on the device while powering on.
                    </p>
                )}
                {sample.fw.map(fw => (
                    <div key={fw.file} className="mb-4">
                        <strong>{fw.type}</strong>
                        <button
                            type="button"
                            className="btn btn-link"
                            onClick={() =>
                                shell.openPath(
                                    dirname(downloadedFilePath(fw.file))
                                )
                            }
                        >
                            {basename(fw.file)}
                        </button>
                        <ProgressBar
                            now={progress.get(fw)}
                            style={{ height: '4px' }}
                        />
                    </div>
                ))}

                <p
                    className="text-muted mb-4"
                    style={{ wordBreak: 'break-all' }}
                >
                    Documentation: <br />
                    <a
                        href={sample.documentation}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {sample.documentation}
                    </a>
                </p>

                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            </Dialog.Body>
            <Dialog.Footer>
                {isProgramming && <Spinner />}

                <DialogButton
                    onClick={() => selectSample(undefined)}
                    disabled={isProgramming}
                >
                    Back
                </DialogButton>

                <DialogButton onClick={close} disabled={isProgramming}>
                    Close
                </DialogButton>
                <DialogButton
                    variant="primary"
                    disabled={isProgramming}
                    onClick={async () => {
                        setIsProgramming(true);
                        setErrorMessage(undefined);
                        try {
                            await downloadSample(sample);
                            await flash(device, sample, progressCb);
                            setIsProgramming(false);
                        } catch (error) {
                            logger.error(error);
                            setErrorMessage(
                                'Unable to program device, please check the log.'
                            );
                            setIsProgramming(false);
                        }
                    }}
                >
                    Program
                </DialogButton>
            </Dialog.Footer>
        </>
    );
};

const WaitingForReconnect = () => (
    <>
        <Dialog.Header title="Reconnect device" />
        <Dialog.Body>
            <p>Waiting for the device to reconnect</p>
        </Dialog.Body>
    </>
);
