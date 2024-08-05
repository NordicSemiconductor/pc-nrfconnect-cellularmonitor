/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    DialogButton,
    GenericDialog,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getShowStartupDialog,
    getShowStartupDialogOnAppStart,
    setShowStartupDialog,
    setShowStartupDialogOnAppStart,
} from './startupSlice';

import './startupDialog.css';

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
                <b style={headerStyle}>Enable Trace in your application</b>
                <p>
                    If you use nRF Connect SDK v2.0.1 or higher, your
                    application must enable modem trace over Universal
                    Asynchronous Receiver/Transmitter (UART) using snippets. You
                    can do this by{' '}
                    <a href="https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/device_guides/nrf91/nrf91_snippet.html#nrf91_modem_tracing_with_uart_backend_using_snippets">
                        adding the `nrf91-modem-trace-uart` snippet to your
                        build configuration
                    </a>
                    , as described in the nRF Connect SDK documentation.
                </p>
                <p>
                    Alternatively, in <b>Advanced options</b> you can{' '}
                    <a href="https://docs.nordicsemi.com/bundle/nrf-connect-cellularmonitor/page/overview.html#program-device">
                        program a sample
                    </a>
                    {' '}with trace enabled and upgrade your modem firmware.
                </p>

                <p>
                    Check also{' '}
                    <a href="https://docs.nordicsemi.com/bundle/nrf-connect-cellularmonitor/page/requirements.html">
                        Cellular Monitor hardware and software requirements
                    </a>
                    .
                </p>
            </div>
        </GenericDialog>
    );
};

const headerStyle: React.CSSProperties = {
    fontSize: '16px',
    marginBottom: '2rem',
};

export default StartupDialog;
