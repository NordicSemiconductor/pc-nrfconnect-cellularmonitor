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
import prettyBytes from 'pretty-bytes';

import {
    setAvailableSerialPorts,
    setSerialPort,
    setTracePath,
    setTraceSize,
} from '../actions';
import { fireEvent, mockedCheckDiskSpace, render } from '../utils/testUtils';
import TraceCollector from './TraceCollector';

mockedCheckDiskSpace.mockImplementation(
    () =>
        new Promise(resolve => {
            resolve({ free: 0, size: 0 });
        })
);

const serialPortActions = [
    setAvailableSerialPorts(['COM1', 'COM2', 'COM3']),
    setSerialPort('COM1'),
];

describe('TraceCollector', () => {
    it('should display the current trace size', async () => {
        const traceSize = 50;
        const screen = render(<TraceCollector />, [
            setTraceSize(traceSize),
            ...serialPortActions,
        ]);
        expect(
            await screen.findByText(`${prettyBytes(traceSize)} file size`)
        ).toBeInTheDocument();
    });

    it('should display the name of the trace', async () => {
        const filePath = 'path/to/file.bin';
        const screen = render(<TraceCollector />, [
            setTracePath(filePath),
            ...serialPortActions,
        ]);
        expect(await screen.findByText('path/to')).toBeInTheDocument();
        expect(await screen.findByText('file.bin')).toBeInTheDocument();
    });

    it('should store RAW as .bin', async () => {
        const screen = render(<TraceCollector />, serialPortActions);
        fireEvent.click(screen.getByText('raw'));
        fireEvent.click(screen.getByText('Start tracing'));
        expect(
            await screen.findByText('.bin', {
                exact: false,
            })
        ).toBeInTheDocument();
    });

    it('should store PCAP as .pcap', async () => {
        const screen = render(<TraceCollector />, serialPortActions);
        fireEvent.click(await screen.findByText('pcap'));
        fireEvent.click(screen.getByText('Start tracing'));
        expect(
            await screen.findByText('.pcap', {
                exact: false,
            })
        ).toBeInTheDocument();
    });

    it('should disable Sink selector while tracing', () => {
        const screen = render(<TraceCollector />, serialPortActions);
        fireEvent.click(screen.getByText('Start tracing'));
        const sinkButton = screen.getByText('raw');
        expect(sinkButton).toBeDisabled();
    });

    it('button text should reflect tracing state', async () => {
        const screen = render(<TraceCollector />, serialPortActions);
        fireEvent.click(screen.getByText('Start tracing'));
        const stopButton = await screen.findByText('Stop tracing');
        fireEvent.click(stopButton);
        expect(await screen.findByText('Start tracing')).toBeInTheDocument();
    });
});
