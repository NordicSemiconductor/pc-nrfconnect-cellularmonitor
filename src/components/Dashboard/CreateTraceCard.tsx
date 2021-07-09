/* Copyright (c) 2015 - 2021, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import { Card, openUrl } from 'pc-nrfconnect-shared';

export default () => (
    // @ts-expect-error: Wrong type definition in shared -- is corrected in shared 4.28.1
    <Card title="Creating a trace">
        <section>
            <ol>
                <li>
                    Program device with an application with tracing enabled
                    according to{' '}
                    <Button
                        variant="link"
                        className="card-links"
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
                        <li>1.2.3</li>
                        <li>1.3.0</li>
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
                    Click the <i>Start trace</i> button to begin collecting a
                    trace in the selected format.
                </li>
            </ol>
        </section>
    </Card>
);
