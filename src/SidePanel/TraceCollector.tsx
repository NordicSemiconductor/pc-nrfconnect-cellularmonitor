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

import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { useDispatch, useSelector } from 'react-redux';
import { getAppDir, Group, logger } from 'pc-nrfconnect-shared';
import prettyBytes from 'pretty-bytes';

import {
    convertTraceFile,
    getTrace,
    NRFML_SINKS,
    stopTrace,
} from '../nrfml/nrfml';
import { getNrfmlTaskId, getTraceSize } from '../reducer';
import { loadTraceFile } from '../utils/fileLoader';
import DiskSpaceUsage from './DiskSpaceUsage';

export default () => {
    const [traceType, setTraceType] = useState(Object.keys(NRFML_SINKS)[0]);
    const [tracing, setTracing] = useState(false);
    const dispatch = useDispatch();
    const nrfmlTaskId = useSelector(getNrfmlTaskId);
    const traceSize = useSelector(getTraceSize);

    const loadTrace = async () => {
        const filename = await loadTraceFile();
        if (!filename) {
            logger.error('Invalid file, please select a valid trace file');
            return;
        }
        dispatch(convertTraceFile(filename));
    };

    const start = () => {
        setTracing(true);
        dispatch(getTrace());
    };

    const stop = () => {
        setTracing(false);
        dispatch(stopTrace(nrfmlTaskId));
    };

    return (
        <>
            <Group heading="Trace file details">
                <ButtonGroup className="trace-selector w-100">
                    {Object.keys(NRFML_SINKS).map((sink: string) => (
                        <Button
                            variant={sink === traceType ? 'set' : 'unset'}
                            onClick={() => setTraceType(sink)}
                            key={sink}
                        >
                            {sink}
                        </Button>
                    ))}
                </ButtonGroup>
            </Group>
            <DiskSpaceUsage />
            {tracing ? (
                <Button
                    className="w-100 secondary-btn start-stop"
                    variant="secondary"
                    onClick={stop}
                >
                    <img
                        alt=""
                        src={`${getAppDir()}/resources/stop-circle.svg`}
                    />
                    Stop tracing
                </Button>
            ) : (
                <Button
                    className="w-100 secondary-btn start-stop"
                    variant="secondary"
                    onClick={start}
                >
                    <img
                        alt=""
                        src={`${getAppDir()}/resources/play-circle.svg`}
                    />
                    Start tracing
                </Button>
            )}
            <hr />
            <Button
                className="w-100 secondary-btn"
                variant="primary"
                onClick={loadTrace}
            >
                Convert Trace
            </Button>

            <Group heading="Trace file size">
                <strong>{prettyBytes(traceSize)}</strong>
            </Group>
        </>
    );
};
