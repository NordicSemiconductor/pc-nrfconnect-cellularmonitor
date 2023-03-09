/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Button, Card, openUrl } from 'pc-nrfconnect-shared';

export default () => (
    <Card title="Creating a trace">
        <section>
            <ol>
                <li>
                    Program device with an application with tracing enabled
                    according to{' '}
                    <Button
                        variant="link"
                        onClick={() =>
                            openUrl(
                                'https://infocenter.nordicsemi.com/index.jsp?topic=%2Fug_trace_collector%2FUG%2Ftrace_collector%2Fcollect_modem_trace.html'
                            )
                        }
                    >
                        this guide
                    </Button>
                    .
                </li>
                <li>
                    If you want <b>PCAP</b> output, ensure that the modem
                    firmware is one of the following versions:{' '}
                    <ul>
                        <li>1.1.4</li>
                        <li>1.1.5</li>
                        <li>1.2.3</li>
                        <li>1.2.7</li>
                        <li>1.2.8</li>
                        <li>1.3.0</li>
                        <li>1.3.1</li>
                        <li>1.3.2</li>
                        <li>1.3.3</li>
                        <li>1.3.4</li>
                    </ul>
                </li>
                <li>
                    Attach the device, select it in the upper left corner and
                    then select which serialport to collect the trace from. If
                    you are on Windows or Linux the application will attempt to
                    detect the correct serialport to use, but this selection can
                    be overridden.
                    <p className="help-text">
                        If the created trace doesn&apos;t contain any data, a
                        solution might be to switch to another serialport.
                    </p>
                </li>
                <li>
                    Select the desired trace output format, either <b>RAW</b> or{' '}
                    <b>PCAP</b>.
                </li>
                <li>
                    Click the <i>Start tracing</i> button to begin collecting a
                    trace in the selected format.
                </li>
            </ol>
        </section>
    </Card>
);
