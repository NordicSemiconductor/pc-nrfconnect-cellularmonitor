/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useDispatch, useSelector } from 'react-redux';
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
    type Source,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { shell } from 'electron';
import { basename, dirname } from 'path';

import { setTerminalSerialPort } from '../terminal/serialPortSlice';
import { autoSetUartSerialPort } from '../terminal/uartSerialPort';
import { resetTraceEvents } from '../tracing/tracePacketEvents';
import { getIsTracing, resetTraceInfo } from '../tracing/traceSlice';
import { resetDashboardState } from '../tracingEvents/dashboardSlice';
import {
    deviceCatalogueId,
    FWClient,
    inFlashOrder,
    isThingy91,
    programDevice,
    programModemFirmware,
    type SampleProgress,
} from './programSample';
// @ts-expect-error We can import svgs
import thingySvg from './thingy91_sw1_sw3.svg';

import './ProgramSampleModal.scss';

/*
 * Two different kinds of `Source` flow through this screen:
 *
 *   1. CATALOGUE ENTRY  — from `readBundledIndex()`. Its `file` is a filename
 *      relative to the app bundle. Display-only. Cannot be flashed, cannot be
 *      passed to `shell.openPath`.
 *
 *   2. RESOLVED SOURCE  — returned by `downloadSample()` /
 *      `downloadModemFirmware()`. Its `file` is an absolute path inside
 *      FIRMWAREDIR. This is the only thing that is safe to flash.
 */

type ProgrammingStage = 'unstarted' | 'programming' | 'success' | 'failed';
type ModalStage = 'programSelection' | 'modemSelection' | 'programming';

const revealFirmwareFile = (file: string) => () => {
    shell.openPath(dirname(file));
};

export default () => {
    const [selectedSample, setSelectedSample] = useState<Source>();

    const [modalVisible, setModalVisible] = useState(false);
    const [modalStage, setModalStage] =
        useState<ModalStage>('programSelection');
    const device = useSelector(selectedDevice);
    const isTracing = useSelector(getIsTracing);

    const catalogueId = deviceCatalogueId(device);
    const compatible = device != null && catalogueId != null;

    const [samples, setSamples] = useState<Source[]>([]);
    const [indexError, setIndexError] = useState<string>();

    useEffect(() => {
        let cancelled = false;

        FWClient.loadIndex()
            .then(index => {
                if (!cancelled) setSamples(index);
            })
            .catch(error => {
                logger.error(error);
                if (!cancelled)
                    setIndexError(
                        'Unable to read the bundled firmware index. Check the log.',
                    );
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const close = useCallback(() => {
        setModalVisible(false);
        setSelectedSample(undefined);
    }, []);

    if (!compatible) {
        return null;
    }

    const applications = samples.filter(
        s => s.type === 'Application' && s.device.includes(catalogueId),
    );
    const modemFirmwares = samples.filter(s => s.type === 'Modem');

    return (
        <>
            <Button
                className="w-100"
                variant="secondary"
                onClick={() => {
                    setModalVisible(!modalVisible);
                    setModalStage('programSelection');
                }}
                disabled={isTracing}
            >
                Program device
            </Button>
            <Dialog isVisible={modalVisible} onHide={close}>
                {modalStage === 'programming' && selectedSample && (
                    <ProgramSample
                        setModalStage={setModalStage}
                        sample={selectedSample}
                        selectSample={setSelectedSample}
                        close={close}
                    />
                )}
                {modalStage === 'modemSelection' && selectedSample && (
                    <ProgramModem
                        setModalStage={setModalStage}
                        sample={selectedSample}
                        selectSample={setSelectedSample}
                        modemFirmwares={modemFirmwares}
                        close={close}
                    />
                )}
                {modalStage === 'programSelection' && (
                    <SelectSample
                        setModalStage={setModalStage}
                        selectSample={setSelectedSample}
                        samples={applications}
                        indexError={indexError}
                        close={close}
                    />
                )}
            </Dialog>
        </>
    );
};

const SelectSample = ({
    setModalStage,
    selectSample,
    samples,
    indexError,
    close,
}: {
    setModalStage: (stage: ModalStage) => void;
    selectSample: (sample: Source) => void;
    samples: Source[];
    indexError?: string;
    close: () => void;
}) => {
    const device = useSelector(selectedDevice);

    const deviceName = device
        ? device.nickname || deviceInfo(device).name
        : 'No device selected';

    return (
        <>
            <Dialog.Header title="Program sample app" />
            <Dialog.Body>
                <p>
                    Make a selection to program the {deviceName} with a
                    pre-compiled application and modem firmware.
                </p>
                {indexError && <Alert variant="danger">{indexError}</Alert>}
                {!indexError && samples.length === 0 && (
                    <Alert variant="info">
                        No sample applications are available for this device.
                    </Alert>
                )}
                <div className="installable-app-grid">
                    {samples.map(sample => (
                        <div
                            key={sample.file}
                            className="card-in-card d-flex flex-column p-3"
                        >
                            <strong className="d-block">{sample.title}</strong>
                            <p className="flex-grow-1 py-2">
                                {sample.description}
                            </p>
                            <Button
                                className="w-100"
                                variant="secondary"
                                onClick={() => {
                                    if (isThingy91(device)) {
                                        setModalStage('modemSelection');
                                    } else {
                                        setModalStage('programming');
                                    }
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
    setModalStage,
    sample,
    selectSample,
    close,
}: {
    setModalStage: (stage: ModalStage) => void;
    /** Catalogue entry. Used as the resolution query and for display text only. */
    sample: Source;
    selectSample: (sample?: Source) => void;
    close: () => void;
}) => {
    const dispatch = useDispatch();

    const device = useSelector(selectedDevice);
    const waitingForReconnect = useSelector(getWaitingForDeviceTimeout);

    /*
     * =========================== STATE REDESIGN ==============================
     *
     * The old code had:
     *
     *   const [selectedFirmware, setSelectedFirmware] = useState(sample);
     *   const [progressMap, setProgressMap] = useState([sample]);
     *
     * `selectedFirmware` was a single `Source` but was used with .map/.find/
     * .length/.filter; `progressMap` was an array but was used with .set/.get/
     * .entries(). Both were leftovers from the era when a "sample" was itself a
     * bundle of several firmwares. Neither compiled.
     *
     * Replaced with three states, each with one job:
     * =========================================================================
     */

    /**
     * The resolved firmwares to flash, in flash order.
     * `undefined` means "not resolved yet" — an honest third state rather than
     * pretending a catalogue entry is a programmable firmware.
     */
    const [firmwares, setFirmwares] = useState<Source[]>();

    /**
     * Files the user has unchecked, keyed by absolute path.
     *
     * CHANGED: the old code used `Source & { selected: boolean }` and mutated
     * `selectedFw.selected` inside a setState updater. Two problems: `selected`
     * is view state that has no business on a domain type, and those objects
     * were shared by reference with the parent's `samples` array, so the
     * mutation leaked into the catalogue. Keeping the flag in a separate Set of
     * strings makes the domain objects immutable by construction.
     */
    const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set());

    /**
     * Flash progress per firmware, keyed by absolute path.
     *
     * CHANGED: was a Map keyed by the firmware *object*. `progressMap.set` used
     * the object handed back by programSample.ts while `progressMap.get(fw)`
     * used an object from a different array — the same reference-equality trap
     * as calling `.includes()` on an array of objects. A string key is stable.
     */
    const [progress, setProgress] = useState<Record<string, number>>({});

    const [resolveError, setResolveError] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [stage, setStage] = useState<ProgrammingStage>('unstarted');

    const isProgramming = stage === 'programming';

    useEffect(() => {
        dispatch(
            setWaitForDevice({
                once: false,
                timeout: 60_000,
                when: 'always',
                onFail: setErrorMessage,
            }),
        );

        return () => {
            dispatch(clearWaitForDevice());
        };
    }, [dispatch]);

    /*
     * ADDED: resolve on mount instead of on click.
     *
     * Why eagerly: the checkbox list needs to know which firmwares exist before
     * the user presses Program, and only the resolved list knows that. The old
     * code called `downloadSample` inside the click handler, which is why the
     * list had nothing real to render.
     *
     * The cancelled flag matters here: resolution hits the network, so the user
     * can hit Back and unmount this component while it is in flight.
     */
    useEffect(() => {
        let cancelled = false;

        setFirmwares(undefined);
        setResolveError(undefined);

        FWClient.getIndexedFirmwareWithDeps(sample)
            .then(resolved => {
                if (!cancelled) setFirmwares(inFlashOrder(resolved));
            })
            .catch(error => {
                logger.error(error);
                if (!cancelled)
                    setResolveError(
                        'Unable to download the firmware. Check the log.',
                    );
            });

        return () => {
            cancelled = true;
        };
    }, [sample]);

    /*
     * CHANGED: functional update, so the callback closes over nothing and can
     * have an empty dependency array. The old version depended on `progressMap`
     * and so was recreated on every progress tick — and because nrfutil holds
     * the callback it was handed at the start of the flash, it would have kept
     * writing into a stale Map.
     *
     * CHANGED: the `firmware as Source` cast is gone; `SampleProgress.firmware`
     * is already `Source`.
     */
    const onProgress = useCallback(
        ({ firmware, progress: firmwareProgress }: SampleProgress) => {
            setProgress(previous => ({
                ...previous,
                [firmware.file]: firmwareProgress.totalProgressPercentage,
            }));
        },
        [],
    );

    /*
     * CHANGED: replaces `toggleFirmwareChecked`. Builds a new Set instead of
     * mutating, so React sees a genuinely new value.
     */
    const toggleSkipped = (file: string) => () => {
        setSkipped(previous => {
            const next = new Set(previous);
            if (next.has(file)) next.delete(file);
            else next.add(file);
            return next;
        });
    };

    const selectedFirmwares = (firmwares ?? []).filter(
        fw => !skipped.has(fw.file),
    );

    const documentation = sample.documentation;
    const isMcuBoot = isThingy91(device);

    return (
        <>
            <Dialog.Header
                title={`Program ${sample.title ?? 'sample'}`}
                showSpinner={
                    isProgramming || waitingForReconnect || firmwares == null
                }
            />
            <Dialog.Body>
                {isMcuBoot && <MCUBootModeInstructions />}

                {/* ADDED: explicit pending state while resolution is in flight. */}
                {firmwares == null && !resolveError && (
                    <p className="text-muted">Downloading firmware…</p>
                )}

                {/* CHANGED: renders the RESOLVED firmwares, so `fw.file` is a
                    real absolute path and both basename() and openPath() work. */}
                {firmwares?.map(fw => (
                    <div key={fw.file} className="mb-4">
                        <div className="d-flex align-items-center">
                            {firmwares.length > 1 && (
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    // CHANGED: derived from `skipped`, not from a
                                    // `selected` field bolted onto the firmware.
                                    checked={!skipped.has(fw.file)}
                                    onChange={toggleSkipped(fw.file)}
                                    id={fw.file}
                                    disabled={isProgramming}
                                />
                            )}

                            <label htmlFor={fw.file} className="mb-0">
                                <strong>{fw.type}</strong>
                            </label>
                            <button
                                type="button"
                                className="btn btn-link"
                                onClick={revealFirmwareFile(fw.file)}
                            >
                                {basename(fw.file)}
                            </button>
                        </div>
                        <ProgressBar
                            // CHANGED: string key lookup; `?? 0` because an
                            // un-flashed firmware has no entry yet and
                            // ProgressBar wants a number.
                            now={progress[fw.file] ?? 0}
                            style={{ height: '4px' }}
                        />
                    </div>
                ))}

                {/* CHANGED: guarded, and uses the normalised union. */}
                {documentation && (
                    <p
                        className="text-muted mb-4"
                        style={{ wordBreak: 'break-all' }}
                    >
                        Documentation: <br />
                        <a
                            href={documentation}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {documentation}
                        </a>
                    </p>
                )}

                {stage === 'success' && (
                    <Alert variant="success">
                        Successfully programmed device
                    </Alert>
                )}
                {resolveError && <Alert variant="danger">{resolveError}</Alert>}
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            </Dialog.Body>
            <Dialog.Footer>
                {waitingForReconnect && device && (
                    <span className="text-muted">
                        Waiting for device to reconnect
                    </span>
                )}

                <DialogButton
                    variant="primary"
                    /*
                     * CHANGED: also disabled until resolution finishes and while
                     * everything is unchecked. Previously the button was live
                     * before any firmware existed.
                     */
                    disabled={
                        isProgramming ||
                        waitingForReconnect ||
                        !device ||
                        firmwares == null ||
                        selectedFirmwares.length === 0
                    }
                    onClick={async () => {
                        if (!device) {
                            throw new Error(
                                'Device must be selected in order to program firmware',
                            );
                        }
                        if (firmwares == null) {
                            throw new Error(
                                'Firmware must be downloaded in order to program it',
                            );
                        }

                        setStage('programming');
                        setErrorMessage(undefined);

                        /*
                         * CHANGED: was `resetProgressMap(progressMap)`, which
                         * mutated the Map in place and returned it — React never
                         * saw a new value, so the bars kept their old fill on a
                         * second run. A plain setState replaces the whole thing.
                         */
                        setProgress({});

                        try {
                            /*
                             * CHANGED: no `downloadSample` call here any more —
                             * resolution happened in the effect above, and its
                             * result is what we flash. This is the fix for the
                             * central bug described at the top of the file.
                             */
                            dispatch(setTerminalSerialPort(null));

                            await programDevice(
                                device,
                                selectedFirmwares,
                                onProgress,
                            );

                            setTimeout(() => {
                                // Test if new fw uses shell mode
                                dispatch(autoSetUartSerialPort(device));
                                dispatch(resetDashboardState());
                                dispatch(resetTraceInfo());
                                resetTraceEvents();
                                setStage('success');
                            }, 3000);
                        } catch (error) {
                            logger.error(error);
                            setErrorMessage(
                                'Unable to program device, please check the log.',
                            );
                            setStage('failed');
                        }
                    }}
                >
                    Program
                </DialogButton>
                <DialogButton
                    onClick={() => {
                        selectSample(undefined);
                        setModalStage('programSelection');
                    }}
                    disabled={isProgramming || !device}
                >
                    Back
                </DialogButton>
                <DialogButton onClick={close} disabled={isProgramming}>
                    Close
                </DialogButton>
            </Dialog.Footer>
        </>
    );
};

const ProgramModem = ({
    setModalStage,
    sample,
    selectSample,
    modemFirmwares,
    close,
}: {
    setModalStage: (stage: ModalStage) => void;
    /*
     * CHANGED: `Sample` / `ModemFirmware` were types from the deleted static
     * manifest module — they weren't even imported, so this file did not
     * compile. Both are `Source` now.
     */
    sample: Source;
    selectSample: (sample?: Source) => void;
    /** Catalogue entries of type 'Modem'. Display-only until resolved. */
    modemFirmwares: Source[];
    close: () => void;
}) => {
    const dispatch = useDispatch();
    const device = useSelector(selectedDevice);

    /** The catalogue entry the user picked — the resolution query. */
    const [selectedMfw, setSelectedMfw] = useState<Source>();

    /*
     * ADDED: the resolved modem firmware, i.e. what actually gets flashed.
     * Without this the old code flashed `selectedMfw`, whose `file` is a
     * relative bundle name.
     */
    const [resolvedMfw, setResolvedMfw] = useState<Source>();

    const waitingForReconnect = useSelector(getWaitingForDeviceTimeout);

    const [progressState, setProgressState] = useState(0);

    const [errorMessage, setErrorMessage] = useState<string>();
    const [stage, setStage] = useState<ProgrammingStage>('unstarted');

    const isProgramming = stage === 'programming';

    useEffect(() => {
        dispatch(
            setWaitForDevice({
                once: false,
                timeout: 60_000,
                when: 'always',
                onFail: setErrorMessage,
            }),
        );

        return () => {
            dispatch(clearWaitForDevice());
        };
    }, [dispatch]);

    /*
     * CHANGED: replaces `newProgressCb`, which built a closure over a
     * `memoizedProgress` variable that was written and never read — a factory
     * that returned a plain setter. This is the same thing without the ceremony.
     */
    const onProgress = useCallback(({ progress }: SampleProgress) => {
        setProgressState(progress.totalProgressPercentage);
    }, []);

    const isMcuBoot = isThingy91(device);

    return (
        <>
            <Dialog.Header
                title="Program Modem Firmware (Optional)"
                showSpinner={isProgramming || waitingForReconnect}
            />
            <Dialog.Body>
                <p>
                    Do you want to program a modem firmware before programming{' '}
                    {/* CHANGED: `sample?.title` — `sample` is a required prop,
                        so the optional chain was dead. `title` itself IS
                        optional, so the fallback stays. */}
                    {sample.title ?? 'the selected application'}?
                </p>
                <div className="installable-app-grid mb-5">
                    {modemFirmwares.map(mfw => (
                        // CHANGED: key was `mfw.title` (optional, not unique).
                        <div
                            key={mfw.file}
                            className="card-in-card d-flex flex-column p-3"
                        >
                            <strong className="d-block">{mfw.title}</strong>
                            <p className="flex-grow-1 py-2">
                                {mfw.description}
                            </p>
                            <Button
                                className="w-100"
                                variant="secondary"
                                disabled={isProgramming}
                                onClick={() => {
                                    /*
                                     * CHANGED: compares `file` instead of object
                                     * identity (`selectedMfw === mfw`). Identity
                                     * happens to work while both come from the
                                     * same array, but breaks the moment the
                                     * catalogue is re-fetched or mapped.
                                     */
                                    const isSelected =
                                        selectedMfw?.file === mfw.file;
                                    setSelectedMfw(
                                        isSelected ? undefined : mfw,
                                    );
                                    // ADDED: the resolved firmware belongs to the
                                    // previous selection; drop it.
                                    setResolvedMfw(undefined);
                                    setProgressState(0);
                                }}
                            >
                                {selectedMfw?.file === mfw.file
                                    ? 'Deselect'
                                    : 'Select'}
                            </Button>
                        </div>
                    ))}
                </div>
                {selectedMfw != null && isMcuBoot ? (
                    <MCUBootModeInstructions />
                ) : null}

                {selectedMfw != null ? (
                    <div key={selectedMfw.file} className="my-4">
                        <div className="d-flex align-items-center">
                            <label htmlFor={selectedMfw.file} className="mb-0">
                                <strong>{selectedMfw.title}</strong>
                            </label>
                            {/*
                             * CHANGED: the "open containing folder" button now
                             * appears only once the firmware is resolved. Before
                             * that there is no absolute path to open — the old
                             * code called downloadedFilePath() on a relative
                             * bundle name.
                             */}
                            {resolvedMfw ? (
                                <button
                                    type="button"
                                    className="btn btn-link"
                                    onClick={revealFirmwareFile(
                                        resolvedMfw.file,
                                    )}
                                >
                                    {basename(resolvedMfw.file)}
                                </button>
                            ) : (
                                <span className="btn btn-link disabled">
                                    {basename(selectedMfw.file)}
                                </span>
                            )}
                        </div>
                        <ProgressBar
                            now={progressState}
                            style={{ height: '4px' }}
                        />
                    </div>
                ) : null}
                {stage === 'success' && (
                    <Alert variant="success">
                        Successfully programmed device
                    </Alert>
                )}
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            </Dialog.Body>

            <Dialog.Footer>
                {stage === 'success' ? (
                    <DialogButton
                        variant="primary"
                        onClick={() => setModalStage('programming')}
                    >
                        Continue
                    </DialogButton>
                ) : (
                    <DialogButton
                        variant="primary"
                        disabled={
                            !selectedMfw ||
                            isProgramming ||
                            waitingForReconnect ||
                            !device
                        }
                        onClick={async () => {
                            if (!device) {
                                throw new Error(
                                    'Device must be selected in order to program firmware',
                                );
                            }

                            if (!selectedMfw) {
                                throw new Error(
                                    'Modem firmware must be selected in order to program it',
                                );
                            }

                            setStage('programming');
                            setErrorMessage(undefined);
                            setProgressState(0);

                            try {
                                /*
                                 * CHANGED: the return value is used. Previously:
                                 *   await downloadModemFirmware(selectedMfw);
                                 *   await programModemFirmware(device, selectedMfw, ...)
                                 * which downloaded the file and then flashed the
                                 * catalogue entry's relative path instead.
                                 */
                                const resolved =
                                    await FWClient.getIndexedFirmware(
                                        selectedMfw,
                                    );
                                setResolvedMfw(resolved);

                                dispatch(setTerminalSerialPort(null));

                                await programModemFirmware(
                                    device,
                                    resolved,
                                    onProgress,
                                );

                                setTimeout(() => {
                                    // Test if new fw uses shell mode
                                    dispatch(autoSetUartSerialPort(device));
                                    dispatch(resetDashboardState());
                                    dispatch(resetTraceInfo());
                                    resetTraceEvents();
                                    setStage('success');
                                }, 3000);
                            } catch (error) {
                                logger.error(error);
                                setErrorMessage(
                                    'Unable to program device, please check the log.',
                                );
                                setStage('failed');
                            }
                        }}
                    >
                        Program
                    </DialogButton>
                )}

                {stage !== 'success' && (
                    <DialogButton
                        disabled={isProgramming}
                        onClick={() => setModalStage('programming')}
                    >
                        Skip
                    </DialogButton>
                )}

                <DialogButton
                    disabled={isProgramming}
                    onClick={() => {
                        selectSample(undefined);
                        setModalStage('programSelection');
                    }}
                >
                    Back
                </DialogButton>

                <DialogButton disabled={isProgramming} onClick={close}>
                    Close
                </DialogButton>
            </Dialog.Footer>
        </>
    );
};

const MCUBootModeInstructions = () => (
    <>
        <strong>Please enable MCUBoot mode:</strong>
        <p>
            Press and hold the black button in the center (SW3) while switching
            on the power with SW1.
        </p>
        <p className="text-center">
            <img src={thingySvg} alt="Thingy91 diagram" />
        </p>
    </>
);
