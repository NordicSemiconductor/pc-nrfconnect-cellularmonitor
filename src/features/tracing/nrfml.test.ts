/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';

import { getMockStore, mockedDataDir } from '../../utils/testUtils';
import { convertTraceFile, startTrace } from './nrfml';
import { sinkConfig } from './sinks';
import { setDetectingTraceDb, setTaskId, setTraceData } from './traceSlice';

jest.mock('../../utils/wireshark', () => ({
    defaultWiresharkPath: () => {
        return 'default/path/to/wireshark';
    },
}));

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

    describe('sink configuration', () => {
        beforeAll(() => {
            Object.defineProperty(process, 'platform', { value: 'MockOS' });
        });

        it('should return proper configuration for raw trace', () => {
            const rawConfig = sinkConfig.raw('some/path');
            expect(rawConfig).toEqual({
                name: 'nrfml-raw-file-sink',
                init_parameters: {
                    file_path: 'some/path',
                },
            });
        });

        it('should return proper configuration for live trace', () => {
            const liveConfig = sinkConfig.live('');
            expect(liveConfig).toEqual({
                name: 'nrfml-wireshark-named-pipe-sink',
                init_parameters: {
                    application_name: 'Trace Collector V2 preview',
                    hw_name: undefined,
                    os_name: 'MockOS',
                    start_process: '"default/path/to/wireshark"',
                },
            });
        });

        it('should return proper configuration for pcap trace', () => {
            const pcapConfig = sinkConfig.pcap('some/path');
            expect(pcapConfig).toEqual({
                name: 'nrfml-pcap-sink',
                init_parameters: {
                    application_name: 'Trace Collector V2 preview',
                    hw_name: undefined,
                    os_name: 'MockOS',
                    file_path: 'some/path',
                },
            });
        });
    });
});
