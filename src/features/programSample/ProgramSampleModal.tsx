/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useDispatch, useSelector } from 'react-redux';
import { shell } from 'electron';
import { basename, dirname } from 'path';
import {
    Alert,
    Button,
    clearWaitForDevice,
    deviceInfo,
    Dialog,
    DialogButton,
    getWaitingForDeviceTimeout,
    logger,
    selectedDevice,
    setWaitForDevice,
} from 'pc-nrfconnect-shared';

import { setUartSerialPort } from '../tracing/traceSlice';
import { is91DK, isThingy91, program, SampleProgress } from './programSample';
import {
    downloadedFilePath,
    downloadSample,
    downloadSampleIndex,
    Firmware,
    initialSamples,
    readBundledIndex,
    Sample,
} from './samples';

import './ProgramSampleModal.scss';

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
                    variant="secondary"
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
        readBundledIndex()
            .then(setSamples)
            .then(() => downloadSampleIndex)
            .then(setSamples);
    }, []);

    const deviceName = device
        ? device.nickname || deviceInfo(device).name
        : 'No device selected';

    const selectedSamples = is91DK(device) ? samples.dk91 : samples.thingy91;

    return (
        <>
            <Dialog.Header title="Program sample app" />
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
                                variant="secondary"
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
    const dispatch = useDispatch();

    const device = useSelector(selectedDevice);
    const waitingForReconnect = useSelector(getWaitingForDeviceTimeout);

    const [selectedFirmware, setSelectedFirmware] = useState(
        sample.fw.map(fw => ({ ...fw, selected: true }))
    );
    const [progress, setProgress] = useState(
        new Map(sample.fw.map(fw => [fw, 0]))
    );

    const [errorMessage, setErrorMessage] = useState<string>();
    const [stage, setStage] = useState<
        'unstarted' | 'programming' | 'success' | 'failed'
    >('unstarted');

    const isProgramming = stage === 'programming';

    useEffect(() => {
        dispatch(
            setWaitForDevice({
                once: false,
                timeout: 60_000,
                when: 'always',
                onFail: setErrorMessage,
            })
        );

        return () => {
            dispatch(clearWaitForDevice());
        };
    }, [dispatch]);

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

    const toggleFirmwareChecked =
        (fw: Firmware & { selected: boolean }) => () => {
            setSelectedFirmware(previous => {
                const selectedFw = previous.find(f => f.file === fw.file);
                if (selectedFw) {
                    selectedFw.selected = !selectedFw?.selected;
                }
                return [...previous];
            });
        };

    const isMcuBoot = isThingy91(device);

    return (
        <>
            <Dialog.Header
                title={`Program ${sample.title}`}
                showSpinner={isProgramming || waitingForReconnect}
            />
            <Dialog.Body>
                <p>This will program the following:</p>
                {isMcuBoot && (
                    <p>
                        <em>
                            Remember to put the device in MCUBoot mode. Press
                            down the center black button on the device while
                            powering on.
                        </em>
                    </p>
                )}
                {selectedFirmware.map(fw => (
                    <div key={fw.file} className="mb-4">
                        <div className="d-flex align-items-center">
                            {selectedFirmware.length > 1 && (
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={fw.selected}
                                    onChange={toggleFirmwareChecked(fw)}
                                    id={fw.file}
                                />
                            )}

                            <label htmlFor={fw.file} className="mb-0">
                                <strong>{fw.type}</strong>
                            </label>
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
                        </div>
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
                {stage === 'success' && (
                    <Alert variant="success">
                        Successfully programmed device
                    </Alert>
                )}
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            </Dialog.Body>
            <Dialog.Footer>
                {waitingForReconnect && device && (
                    <span className="text-muted">
                        Waiting for device to reconnect
                    </span>
                )}

                <DialogButton
                    onClick={() => selectSample(undefined)}
                    disabled={isProgramming || !device}
                >
                    Back
                </DialogButton>

                <DialogButton onClick={close} disabled={isProgramming}>
                    Close
                </DialogButton>
                <DialogButton
                    variant="primary"
                    disabled={isProgramming || waitingForReconnect || !device}
                    onClick={async () => {
                        if (!device) {
                            throw new Error(
                                'Device must be selected in order to program firmware'
                            );
                        }

                        setStage('programming');
                        setErrorMessage(undefined);

                        try {
                            await downloadSample(sample);
                            dispatch(setUartSerialPort(null));

                            await program(
                                device,
                                selectedFirmware.filter(fw => fw.selected),
                                progressCb
                            );
                            setStage('success');
                        } catch (error) {
                            logger.error(error);
                            setErrorMessage(
                                'Unable to program device, please check the log.'
                            );
                            setStage('failed');
                        }
                    }}
                >
                    Program
                </DialogButton>
            </Dialog.Footer>
        </>
    );
};