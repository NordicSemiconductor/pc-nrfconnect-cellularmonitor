/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';

import { getMockStore, mockedDataDir } from '../../utils/testUtils';
import { convertTraceFile, startTrace } from './nrfml';
import { sinkConfig } from './sinks';
import { setDetectingTraceDb, setTraceIsStarted } from './traceSlice';

const MOCKED_DEFAULT_WIRESHARK_PATH = 'default/path/to/wireshark';

jest.mock('../../utils/wireshark', () => ({
    defaultWiresharkPath: () => {
        return MOCKED_DEFAULT_WIRESHARK_PATH;
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
                type: setTraceIsStarted.type,
                payload: {
                    taskId: 1,
                    progressConfigs: [
                        {
                            format: 'pcap',
                            path: 'somePath.pcapng',
                        },
                    ],
                },
            },
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
                    type: setTraceIsStarted.type,
                    payload: {
                        taskId: 1,
                        progressConfigs: [
                            {
                                format: 'pcap',
                                path: path.join(
                                    mockedDataDir,
                                    'trace-2000-01-01T00-00-00.000Z.pcapng'
                                ),
                            },
                        ],
                    },
                },
            ]);
        });

        it('should start tracing to raw binary', () => {
            store.dispatch(startTrace(['raw']));
            expect(store.getActions()).toEqual([
                {
                    type: setTraceIsStarted.type,
                    payload: {
                        taskId: 1,
                        progressConfigs: [
                            {
                                format: 'raw',
                                path: path.join(
                                    mockedDataDir,
                                    'trace-2000-01-01T00-00-00.000Z.bin'
                                ),
                            },
                        ],
                    },
                },
            ]);
        });
    });

    describe('sink configuration', () => {
        beforeAll(() => {
            Object.defineProperty(process, 'platform', { value: 'MockOS' });
        });

        it('should return proper configuration for raw trace', () => {
            const rawConfig = sinkConfig('raw', 'some/path');
            expect(rawConfig).toEqual({
                name: 'nrfml-raw-file-sink',
                init_parameters: {
                    file_path: 'some/path.bin',
                },
            });
        });

        it('should return proper configuration for live trace', () => {
            const liveConfig = sinkConfig('live', '');
            expect(liveConfig).toEqual({
                name: 'nrfml-wireshark-named-pipe-sink',
                init_parameters: {
                    application_name: 'Trace Collector V2 preview',
                    hw_name: undefined,
                    os_name: 'MockOS',
                    start_process: MOCKED_DEFAULT_WIRESHARK_PATH,
                },
            });
        });

        it('should return proper configuration for pcap trace', () => {
            const pcapConfig = sinkConfig('pcap', 'some/path');
            expect(pcapConfig).toEqual({
                name: 'nrfml-pcap-sink',
                init_parameters: {
                    application_name: 'Trace Collector V2 preview',
                    hw_name: undefined,
                    os_name: 'MockOS',
                    file_path: 'some/path.pcapng',
                },
            });
        });
    });
});
