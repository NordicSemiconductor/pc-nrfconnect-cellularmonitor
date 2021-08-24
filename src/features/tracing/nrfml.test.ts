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

import path from 'path';

import { getMockStore, mockedDataDir } from '../../utils/testUtils';
import { convertTraceFile, startTrace } from './nrfml';

const mockStore = getMockStore();
const SET_TRACE_SIZE_ACTION = 'trace/setTraceSize';
const SET_TRACE_PATH_ACTION = 'trace/setTracePath';
const SET_TASK_ID_ACTION = 'trace/setTaskId';

const initialState = {
    app: {
        trace: {
            traceSize: 0,
            serialPort: 'COM1',
        },
    },
    device: {
        devices: {},
    },
};

const store = mockStore(initialState);

describe('nrfml', () => {
    beforeEach(() => {
        store.clearActions();
    });

    it('should start converting', () => {
        store.dispatch(convertTraceFile('somePath.bin'));
        expect(store.getActions()).toEqual([
            { type: SET_TRACE_SIZE_ACTION, payload: 0 },
            { type: SET_TASK_ID_ACTION, payload: 1 },
            { type: SET_TRACE_PATH_ACTION, payload: 'somePath.pcapng' },
        ]);
    });

    describe('tracing', () => {
        beforeEach(() => {
            jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(
                '2000-01-01T00:00:00.000Z'
            );
        });

        it('should start tracing to pcap', () => {
            store.dispatch(startTrace('pcap'));
            expect(store.getActions()).toEqual([
                { type: SET_TRACE_SIZE_ACTION, payload: 0 },
                {
                    type: SET_TRACE_PATH_ACTION,
                    payload: path.join(
                        mockedDataDir,
                        'trace-2000-01-01T00-00-00.000Z.pcapng'
                    ),
                },
                { type: SET_TASK_ID_ACTION, payload: 1 },
            ]);
        });

        it('should start tracing to raw binary', () => {
            store.dispatch(startTrace('raw'));
            expect(store.getActions()).toEqual([
                { type: SET_TRACE_SIZE_ACTION, payload: 0 },
                {
                    type: SET_TRACE_PATH_ACTION,
                    payload: path.join(
                        mockedDataDir,
                        'trace-2000-01-01T00-00-00.000Z.bin'
                    ),
                },
                { type: SET_TASK_ID_ACTION, payload: 1 },
            ]);
        });
    });
});