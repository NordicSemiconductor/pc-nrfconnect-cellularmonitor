/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
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
