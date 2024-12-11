/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { useSelector } from 'react-redux';
import { dialog } from '@electron/remote';
import { logger, SerialPort } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { readFileSync } from 'fs';
import { homedir } from 'os';

import { ShellParser } from '../shell/shellParser';
import {
    getShellParser,
    getTerminalSerialPort,
} from '../terminal/serialPortSlice';
import { sendSingleCommand } from '../tracingEvents/at/sendCommand';

const deleteTLSCredential = async (
    secTag: number,
    type: number,
    uartSerialPort: SerialPort | null,
    shellParser: ShellParser | null
) => {
    const command = `AT%CMNG=3,${secTag},${type}`;
    const response = await sendSingleCommand(
        uartSerialPort,
        shellParser,
        command
    );

    if (response?.includes('OK')) {
        logger.info('Successfully deleted TLS credential');
    } else {
        logger.error('Unable to delete TLS credential');
    }
};

const writeTLSCredential = async (
    secTag: number,
    type: number,
    content: string,
    uartSerialPort: SerialPort | null,
    shellParser: ShellParser | null
) => {
    const command = `AT%CMNG=0,${secTag},${type},"${content.trim()}"`;
    const response = await sendSingleCommand(
        uartSerialPort,
        shellParser,
        command
    );
    if (response?.includes('OK')) {
        logger.info('Successfully deleted TLS credential');
    } else {
        logger.error('Unable to Write TLS credential');
    }
};

const NRF_CLOUD_TAG = 16842753;

const FormGroupWithCheckbox = ({
    controlId,
    controlProps,
    label,
    value,
    set,
    clearLabel,
    clear,
    setClear,
    subText,
}: {
    controlId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    controlProps: any;
    label: string;
    value: string;
    set: (value: string) => void;
    clearLabel?: string;
    clear: boolean;
    setClear: (value: boolean) => void;
    subText?: string;
}) => (
    <Form.Group as={Row} controlId={controlId}>
        <Col xs={11}>
            <Form.Label>{label}</Form.Label>
            <Form.Control
                {...controlProps}
                value={value}
                onChange={({ target }) => set(target.value)}
                disabled={clear}
            />
            {subText && <Form.Text className="text-muted">{subText}</Form.Text>}
        </Col>
        <Col xs={1} className="pl-0">
            <Form.Label>{clearLabel}&nbsp;</Form.Label>
            <Form.Check
                type="checkbox"
                aria-label="Delete"
                checked={clear}
                onChange={({ target }) => setClear(target.checked)}
            />
        </Col>
    </Form.Group>
);

export default ({ active }: { active: boolean }) => {
    const [caCert, setCACert] = useState('');
    const [clientCert, setClientCert] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [preSharedKey, setPreSharedKey] = useState('');
    const [pskIdentity, setPskIdentity] = useState('');
    const [clearCaCert, setClearCACert] = useState(false);
    const [clearClientCert, setClearClientCert] = useState(false);
    const [clearPrivateKey, setClearPrivateKey] = useState(false);
    const [clearPreSharedKey, setClearPreSharedKey] = useState(false);
    const [clearPskIdentity, setClearPskIdentity] = useState(false);
    const [secTag, setSecTag] = useState(NRF_CLOUD_TAG);
    const [showWarning, setShowWarning] = useState(false);

    const uartPort = useSelector(getTerminalSerialPort);
    const shellParser = useSelector(getShellParser);

    function parseSecTag(secTagAsString: string) {
        if (secTagAsString === '') {
            return;
        }
        const newSecTag = Number(secTagAsString);
        if (Number.isNaN(newSecTag)) {
            logger.error(`Parsed an invalid Security tag: ${secTagAsString}`);
            return;
        }
        setSecTag(newSecTag);
    }

    function loadJsonFile(filename: string) {
        if (!filename) {
            return;
        }
        try {
            const json = JSON.parse(readFileSync(filename, 'utf8'));
            setCACert(json.caCert || '');
            setClientCert(json.clientCert || '');
            setPrivateKey(json.privateKey || '');
            parseSecTag(json.secTag || '');
        } catch (err) {
            logger.error((err as Error).message);
        }
    }

    const selectJsonFile = async () => {
        const {
            filePaths: [filename],
        } =
            (await dialog.showOpenDialog({
                defaultPath: homedir(),
                properties: ['openFile'],
            })) || [];
        loadJsonFile(filename);
    };

    const performCertificateUpdate = async () => {
        setShowWarning(false);

        async function oneUpdate(
            info: string,
            type: number,
            content: string,
            clear: boolean
        ) {
            if (clear) {
                logger.info(`Clearing ${info}...`);
                try {
                    deleteTLSCredential(secTag, type, uartPort, shellParser);
                } catch (err) {
                    logger.error((err as Error).message);
                }
            } else if (content) {
                logger.info(`Updating ${info}...`);
                try {
                    await writeTLSCredential(
                        secTag,
                        type,
                        content,
                        uartPort,
                        shellParser
                    );
                } catch (err) {
                    logger.error((err as Error).message);
                }
            }
        }
        await oneUpdate('CA certificate', 0, caCert, clearCaCert);
        await oneUpdate('client certificate', 1, clientCert, clearClientCert);
        await oneUpdate('private key', 2, privateKey, clearPrivateKey);
        await oneUpdate('pre-shared key', 3, preSharedKey, clearPreSharedKey);
        await oneUpdate('PSK identity', 4, pskIdentity, clearPskIdentity);

        logger.info('Certificate update completed');
    };

    const updateCertificate = () => {
        if (
            clearCaCert ||
            clearClientCert ||
            clearPrivateKey ||
            clearPreSharedKey ||
            clearPskIdentity
        ) {
            return setShowWarning(true);
        }
        return performCertificateUpdate();
    };

    const className =
        'd-flex flex-column p-4 h-100 tw-overflow-y-scroll styled-scroll';
    const textAreaProps = {
        as: 'textarea',
        className: 'text-monospace',
        rows: 4,
    };
    const textProps = { type: 'text' };

    return (
        <div className={`${className} ${active ? 'hidden' : ''}`}>
            <Alert variant="info">
                <span className="mdi mdi-information mdi-36px float-left pr-3" />
                <div style={{ lineHeight: '1.5rem', userSelect: 'text' }}>
                    The modem must be in <strong>offline</strong> state (
                    <code>AT+CFUN=4</code>) for updating certificates.
                    <br />
                    You can drag-and-drop a JSON file over this window.
                    <br />
                    You can use <code>AT%CMNG=1</code> command in the Terminal
                    screen to list all stored certificates.
                    <br />
                    Make sure your device runs a firmware with increased buffer
                    to support long AT-commands.
                    <br />
                    Use security tag <code>{NRF_CLOUD_TAG}</code> to manage nRF
                    Cloud certificate, otherwise pick a different tag.
                </div>
            </Alert>
            <div className="mb-4 mt-4 pr-4">
                <div className="tw-grid tw-grid-cols-3 tw-gap-4">
                    <div className="tw-col-span-3 lg:tw-col-span-2">
                        {FormGroupWithCheckbox({
                            controlId: 'certMgr.caCert',
                            controlProps: textAreaProps,
                            label: 'CA certificate',
                            value: caCert,
                            set: setCACert,
                            clearLabel: 'Delete',
                            clear: clearCaCert,
                            setClear: setClearCACert,
                        })}
                        {FormGroupWithCheckbox({
                            controlId: 'certMgr.clientCert',
                            controlProps: textAreaProps,
                            label: 'Client certificate',
                            value: clientCert,
                            set: setClientCert,
                            clear: clearClientCert,
                            setClear: setClearClientCert,
                        })}
                        {FormGroupWithCheckbox({
                            controlId: 'certMgr.privKey',
                            controlProps: textAreaProps,
                            label: 'Private key',
                            value: privateKey,
                            set: setPrivateKey,
                            clear: clearPrivateKey,
                            setClear: setClearPrivateKey,
                        })}
                    </div>
                    <div className="tw-col-span-3 lg:tw-col-span-1">
                        {FormGroupWithCheckbox({
                            controlId: 'certMgr.preSharedKey',
                            controlProps: textProps,
                            label: 'Pre-shared key',
                            value: preSharedKey,
                            set: setPreSharedKey,
                            clearLabel: 'Delete',
                            clear: clearPreSharedKey,
                            setClear: setClearPreSharedKey,
                            subText: 'ASCII text in hexadecimal string format',
                        })}
                        {FormGroupWithCheckbox({
                            controlId: 'certMgr.pskIdentity',
                            controlProps: textProps,
                            label: 'PSK identity',
                            value: pskIdentity,
                            set: setPskIdentity,
                            clear: clearPskIdentity,
                            setClear: setClearPskIdentity,
                        })}
                        <Form.Group
                            as={Row}
                            controlId="certMgr.secTag"
                            className="mt-5"
                        >
                            <Form.Label column>Security tag</Form.Label>
                            <Col md="auto">
                                <Form.Control
                                    type="text"
                                    value={secTag}
                                    onChange={({ target }) => {
                                        const tag = Number(target.value);
                                        if (Number.isNaN(tag)) return;

                                        setSecTag(tag);
                                    }}
                                />
                            </Col>
                        </Form.Group>
                    </div>
                </div>
            </div>
            <ButtonGroup className="align-self-end">
                <Button
                    variant="secondary"
                    className="mr-2"
                    onClick={selectJsonFile}
                >
                    Load from JSON
                </Button>
                <Button variant="primary" onClick={updateCertificate}>
                    Update certificates
                </Button>
            </ButtonGroup>

            <Modal show={showWarning} onHide={() => setShowWarning(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Warning</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You are about to delete credentials, are you sure to
                    proceed?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowWarning(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={performCertificateUpdate}
                    >
                        Proceed
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
