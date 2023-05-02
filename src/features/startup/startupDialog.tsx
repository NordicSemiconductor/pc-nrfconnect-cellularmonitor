/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    DialogButton,
    GenericDialog,
    openUrl,
    Toggle,
} from 'pc-nrfconnect-shared';

import { getShowStartupDialog, setShowStartupDialog } from './startupSlice';

import './startupDialog.css';

const StartupDialog = () => {
    const dispatch = useDispatch();
    const showStartupDialog = useSelector(getShowStartupDialog);
    const [visible, setVisible] = useState(showStartupDialog);
    const [showOnNextStartup, setShowOnNextStartup] =
        useState(showStartupDialog);

    if (!visible) {
        return null;
    }

    return (
        <GenericDialog
            onHide={() => {
                setVisible(false);
                if (showOnNextStartup !== showStartupDialog) {
                    dispatch(setShowStartupDialog(showOnNextStartup));
                }
            }}
            closeOnEsc
            isVisible={visible}
            // headerIcon={headerIcon}
            title="How to use Cellular Monitor"
            // className={className}
            size="xl"
            footer={
                <>
                    <DialogButton
                        onClick={() => {
                            setVisible(false);
                            if (showOnNextStartup !== showStartupDialog) {
                                dispatch(
                                    setShowStartupDialog(showOnNextStartup)
                                );
                            }
                        }}
                    >
                        Close
                    </DialogButton>
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
            <div
                style={{
                    display: 'flex',
                    marginBottom: '32px',
                    userSelect: 'text',
                }}
                className="startup-dialog"
            >
                <div style={boxStyle}>
                    <b style={boxHeaderStyle}>
                        1. Before you can use Cellular Monitor
                    </b>
                    <p>Enable Trace in your application as follows:</p>
                    <ul>
                        <li>
                            If you use nRF Connect SDK v2.0.1 or higher, add the
                            following Kconfig snippets to enable trace and AT
                            commands (optional) in your application firmware:
                        </li>
                        <pre
                            style={{
                                whiteSpace: 'pre-wrap',
                                userSelect: 'text',
                            }}
                        >
                            <code>CONFIG_NRF_MODEM_LIB_TRACE=y</code>
                            <br />
                            <code>
                                CONFIG_AT_HOST_LIBRARY=y # (note this is
                                optional)
                            </code>
                        </pre>
                        <li>
                            Or you can program a provided sample, which you can
                            find in the Cellular Monitor left panel under
                            Advanced Options
                        </li>
                    </ul>
                    <p>
                        Attach your device to a USB port on the computer and
                        turn it on.
                    </p>
                    <p>Program the application firmware to your device.</p>
                </div>
                <div style={boxStyle}>
                    <b style={boxHeaderStyle}>2. In Cellular Monitor</b>
                    <p>
                        Start a trace:
                        <ul>
                            <li>
                                Click <b>SELECT DEVICE</b> and select your
                                device.
                            </li>
                            <li>
                                Click <b>START</b> to start tracing.
                            </li>
                            <li>
                                Optionally:
                                <ul>
                                    <li>
                                        Click <b>Run recommended AT commands</b>{' '}
                                        to gather status information.
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </p>

                    <p>
                        Monitor the trace output as follows:
                        <ul>
                            <li>
                                Expand the <b>Connection Status</b> in the left
                                panel to follow progress.
                            </li>
                            <li>
                                You can view connection layer events and
                                patterns in the <b>Packet Event Viewer</b>.
                            </li>
                            <li>
                                The DASHBOARD cards are populated with
                                information on the connection and its
                                components. You can access details in tooltips
                                by hovering over each attribute.
                            </li>
                            <li>
                                You can also view live trace in Wireshark by
                                toggling <b>Open in Wireshark</b>.
                            </li>
                        </ul>
                    </p>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <div style={boxStyle}>
                    <b style={boxHeaderStyle}>
                        Background information and useful links:
                    </b>
                    <p>
                        A cellular connection involves the interoperation of
                        diverse components. Sometimes, not everything goes
                        according to plan, and we need information about what
                        happened. The modem core of an nRF9160 System in Package
                        (SiP) collects data about the connection in a modem
                        trace. Cellular Monitor allows you to access the trace
                        data, to visualize the connection, and provides tools to
                        help you understand, optimize, and/or troubleshoot.
                    </p>
                </div>
                <div style={{ display: 'flex', width: '75%' }}>
                    <div style={boxStyle}>
                        <p>
                            Minimum requirements:
                            <ul style={{ padding: 0 }}>
                                <li>nRF9160 DK and micro-USB cable</li>
                                <li>or Nordic Thingy:91™</li>
                                <li>
                                    A nano SIM card that supports LTE-M or
                                    NB-IoT
                                </li>
                                <li>Modem firmware version 1.3.1 or higher</li>
                                <li>Application with Trace enabled</li>
                                <li>nRF Connect SDK v2.0.1 or higher</li>
                                <li>Wireshark (optional)</li>
                            </ul>
                        </p>
                    </div>
                    <div style={boxStyle}>
                        <p>
                            Useful links:
                            <li>
                                <Button
                                    className="startup-dialog__button"
                                    variant="link"
                                    onClick={() =>
                                        openUrl(
                                            'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fug_nrf91_dk%2FUG%2Fnrf91_DK%2Fintro.html&cp=2_0_4'
                                        )
                                    }
                                    title="https://infocenter.nordicsemi.com/index.jsp?topic=%2Fug_nrf91_dk%2FUG%2Fnrf91_DK%2Fintro.html&cp=2_0_4"
                                >
                                    nRF9160 DK Hardware user guide
                                </Button>
                            </li>
                            <li>
                                <Button
                                    className="startup-dialog__button"
                                    variant="link"
                                    onClick={() =>
                                        openUrl(
                                            'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fug_thingy91%2FUG%2Fthingy91%2Fintro%2Ffrontpage.html'
                                        )
                                    }
                                    title="https://infocenter.nordicsemi.com/index.jsp?topic=%2Fug_thingy91%2FUG%2Fthingy91%2Fintro%2Ffrontpage.html"
                                >
                                    Nordic Thingy:91™ Hardware
                                </Button>
                            </li>
                            <li>
                                <Button
                                    className="startup-dialog__button"
                                    variant="link"
                                    onClick={() =>
                                        openUrl(
                                            'https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/getting_started/modifying.html#modifying-an-application'
                                        )
                                    }
                                    title="https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/getting_started/modifying.html#modifying-an-application"
                                >
                                    Modifying an NCS application
                                </Button>
                            </li>
                            <li>
                                <Button
                                    className="startup-dialog__button"
                                    variant="link"
                                    onClick={() =>
                                        openUrl(
                                            'https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/kconfig/index.html#CONFIG_NRF_MODEM_LIB_TRACE'
                                        )
                                    }
                                    title="https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/kconfig/index.html#CONFIG_NRF_MODEM_LIB_TRACE"
                                >
                                    Kconfig search — CONFIG_NRF_MODEM_LIB_TRACE
                                </Button>
                            </li>
                            <li>
                                <Button
                                    className="startup-dialog__button"
                                    variant="link"
                                    onClick={() =>
                                        openUrl(
                                            'https://academy.nordicsemi.com/lessons/lesson-7-cellular-fundamentals/'
                                        )
                                    }
                                    title="https://academy.nordicsemi.com/lessons/lesson-7-cellular-fundamentals/"
                                >
                                    DevAcademy - Lesson 7 – Debugging with a
                                    modem trace
                                </Button>
                            </li>
                        </p>
                    </div>
                </div>
            </div>
        </GenericDialog>
    );
};

const boxStyle: React.CSSProperties = {
    width: '60%',
    padding: '16px',
    fontSize: '14px',
};
const boxHeaderStyle: React.CSSProperties = {
    fontSize: '16px',
    marginBottom: '2rem',
};

export default StartupDialog;
