/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import '../../utils/testUtils';

import { testUtils } from '@nordicsemiconductor/pc-nrfconnect-shared/test';
import { configureStore } from '@reduxjs/toolkit';

import appReducer from '../../appReducer';
import {
    getIsTracing,
    getTaskId,
    getTraceProgress,
    setTraceIsStarted,
    setTraceIsStopped,
    setTraceProgress,
} from './traceSlice';

const reducer = testUtils.rootReducer(appReducer);

const A_TRACE_ID = 1n;

const A_PATH = 'a/path';
const ANOTHER_PATH = 'another/path';

describe('trace slice', () => {
    describe('initial state', () => {
        test('trace formats are set to default', () => {
            const store = configureStore({ reducer: appReducer });
            const { selectedFormats } = store.getState().trace;
            expect(selectedFormats.length).toBe(1);
        });
    });

    describe('when starting a trace', () => {
        const startTrace = setTraceIsStarted({
            taskId: A_TRACE_ID,
            progressConfigs: [
                { format: 'raw', path: A_PATH },
                { format: 'pcap', path: ANOTHER_PATH },
            ],
        });
        const tracingStarted = testUtils.dispatchTo(reducer, [startTrace]);

        test('isTracing is true', () => {
            expect(getIsTracing(tracingStarted)).toBeTruthy();
        });

        test('a trace ID is set', () => {
            expect(getTaskId(tracingStarted)).toEqual(A_TRACE_ID);
        });

        test('the trace progress is initialised', () => {
            expect(getTraceProgress(tracingStarted)).toEqual([
                { format: 'raw', path: A_PATH, size: 0 },
                { format: 'pcap', path: ANOTHER_PATH, size: 0 },
            ]);
        });
    });

    describe('while progression on a trace', () => {
        test('progress is recorded for all files', () => {
            const startTrace = setTraceIsStarted({
                taskId: A_TRACE_ID,
                progressConfigs: [
                    { format: 'raw', path: A_PATH },
                    { format: 'pcap', path: ANOTHER_PATH },
                ],
            });
            const progressOnTrace = setTraceProgress({
                path: A_PATH,
                size: 10,
            });

            const tracingStopped = testUtils.dispatchTo(reducer, [
                startTrace,
                progressOnTrace,
            ]);

            expect(getTraceProgress(tracingStopped)).toEqual([
                { format: 'raw', path: A_PATH, size: 10 },
                { format: 'pcap', path: ANOTHER_PATH, size: 0 },
            ]);
        });

        test('progress is ignored for unknown files', () => {
            const startTrace = setTraceIsStarted({
                taskId: A_TRACE_ID,
                progressConfigs: [{ format: 'raw', path: A_PATH }],
            });
            const progressOnTrace = setTraceProgress({
                path: ANOTHER_PATH,
                size: 20,
            });

            const tracingStopped = testUtils.dispatchTo(reducer, [
                startTrace,
                progressOnTrace,
            ]);

            expect(getTraceProgress(tracingStopped)).toEqual([
                { format: 'raw', path: A_PATH, size: 0 },
            ]);
        });
    });

    describe('when stopping a trace', () => {
        const startTrace = setTraceIsStarted({
            taskId: A_TRACE_ID,
            progressConfigs: [{ format: 'raw', path: A_PATH }],
        });
        const progressOnTrace = setTraceProgress({ path: A_PATH, size: 10 });
        const stopTrace = setTraceIsStopped();

        const tracingStopped = testUtils.dispatchTo(reducer, [
            startTrace,
            progressOnTrace,
            stopTrace,
        ]);

        test('isTracing is false', () => {
            expect(getIsTracing(tracingStopped)).toBeFalsy();
        });

        test('the trace progress remains', () => {
            expect(getTraceProgress(tracingStopped)).toEqual([
                { format: 'raw', path: A_PATH, size: 10 },
            ]);
        });
    });
});
