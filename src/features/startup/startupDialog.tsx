/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clipboard } from 'electron';
import {
    Button,
    DialogButton,
    GenericDialog,
    Toggle,
} from 'pc-nrfconnect-shared';

import Copy from '../../components/Copy';
import {
    getShowStartupDialog,
    getShowStartupDialogOnAppStart,
    setShowStartupDialog,
    setShowStartupDialogOnAppStart,
} from './startupSlice';

import './startupDialog.css';

const Config = [
    'CONFIG_NRF_MODEM_LIB_TRACE=y',
    'CONFIG_AT_HOST_LIBRARY = y #(note this is optional)',
];

const copyConfigToClipboard = () => {
    clipboard.writeText(Config.join('\n'));
};

const StartupDialog = () => {
    const dispatch = useDispatch();
    const showStartupDialogOnAppStart = useSelector(
        getShowStartupDialogOnAppStart
    );
    const showStartupDialog = useSelector(getShowStartupDialog);

    const [visible, setVisible] = useState(showStartupDialogOnAppStart);
    const [showOnNextStartup, setShowOnNextStartup] = useState(
        showStartupDialogOnAppStart
    );

    useEffect(() => {
        if (!visible && showStartupDialog) {
            setVisible(true);
        }
    }, [visible, showStartupDialog]);

    const hideDialog = () => {
        setVisible(false);
        dispatch(setShowStartupDialog(false));
        if (showOnNextStartup !== showStartupDialogOnAppStart) {
            dispatch(setShowStartupDialogOnAppStart(showOnNextStartup));
        }
    };

    if (!visible) {
        return (
            <Button
                variant="secondary"
                key="button"
                className="mt-3"
                onClick={() => dispatch(setShowStartupDialog(true))}
            >
                Open &apos;How to use&apos;
            </Button>
        );
    }

    return (
        <GenericDialog
            onHide={hideDialog}
            closeOnEsc
            isVisible={visible}
            title="How to use Cellular Monitor"
            size="xl"
            footer={
                <>
                    <DialogButton onClick={hideDialog}>Close</DialogButton>
                    <Toggle
                        label="Show on startup"
                        title={
                            showStartupDialog
                                ? 'Toggle in order to hide this dialog on startup'
                                : 'Toggle in order to show this dialog on startup'
                        }
                        onToggle={() =>
                            setShowOnNextStartup(!showOnNextStartup)
                        }
                        isToggled={showOnNextStartup}
                    />
                </>
            }
        >
            <div style={{ padding: '32px' }}>
                <b style={headerStyle}>
                    Enable Trace in your application as follows:
                </b>
                <p>
                    If you use nRF Connect SDK v2.0.1 or higher, add the
                    following Kconfig snippets to enable trace and AT commands*
                    in your application firmware.
                </p>
                <pre
                    style={{
                        whiteSpace: 'pre-wrap',
                        userSelect: 'text',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    {Config.join('\n')}
                    <Copy
                        data={Config.join('\n')}
                        size={0.9}
                        style={{ marginLeft: '8px' }}
                    />
                </pre>

                <p>
                    Alternatively, in Advanced Options you can program a sample
                    with trace enabled and upgrade your modem firmware.
                </p>

                <p>
                    Minimum requirements:
                    <ul>
                        <li>
                            A Nordic Semiconductor cellular device, such as an
                            nRF91 series DK or Nordic Thingy:91™
                        </li>
                        <li>A nano SIM card supporting LTE-M or NB-IoT</li>
                        <li>Modem firmware version 1.3.1 or higher</li>
                    </ul>
                </p>

                <p>* Optional</p>
            </div>
        </GenericDialog>
    );
};

const headerStyle: React.CSSProperties = {
    fontSize: '16px',
    marginBottom: '2rem',
};

export default StartupDialog;
