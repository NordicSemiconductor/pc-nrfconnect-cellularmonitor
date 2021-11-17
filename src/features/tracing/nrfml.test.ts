/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';

import { getMockStore, mockedDataDir } from '../../utils/testUtils';
import { convertTraceFile, startTrace } from './nrfml';
import { setDetectingTraceDb, setTaskId, setTraceData } from './traceSlice';

const mockStore = getMockStore();

const initialState = {
    app: {
        trace: {
            traceData: [],
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
            {
                type: setTraceData.type,
                payload: [
                    {
                        format: 'pcap',
                        size: 0,
                        path: 'somePath.pcapng',
                    },
                ],
            },
            { type: setTaskId.type, payload: 1 },
        ]);
    });

    describe('tracing', () => {
        beforeEach(() => {
            jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(
                '2000-01-01T00:00:00.000Z'
            );
        });

        it('should start tracing to pcap', () => {
            store.dispatch(startTrace(['pcap']));
            expect(store.getActions()).toEqual([
                { type: setDetectingTraceDb.type, payload: true },
                {
                    type: setTraceData.type,
                    payload: [
                        {
                            format: 'pcap',
                            size: 0,
                            path: path.join(
                                mockedDataDir,
                                'trace-2000-01-01T00-00-00.000Z.pcapng'
                            ),
                        },
                    ],
                },
                { type: setTaskId.type, payload: 1 },
            ]);
        });

        it('should start tracing to raw binary', () => {
            store.dispatch(startTrace(['raw']));
            expect(store.getActions()).toEqual([
                {
                    type: setTraceData.type,
                    payload: [
                        {
                            format: 'raw',
                            size: 0,
                            path: path.join(
                                mockedDataDir,
                                'trace-2000-01-01T00-00-00.000Z.bin'
                            ),
                        },
                    ],
                },
                { type: setTaskId.type, payload: 1 },
            ]);
        });
    });
});
