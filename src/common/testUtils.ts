/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TraceTaskBuilder } from '@nordicsemi/nrfml-js';
import {
    type AppDispatch,
    currentPane,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { testUtils } from '@nordicsemiconductor/pc-nrfconnect-shared/test';
import checkDiskSpace from 'check-disk-space';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import appReducer from '../app/appReducer';

export const getNrfmlProgressCallback = () =>
    new Promise<
        Parameters<typeof TraceTaskBuilder.prototype.withProgressCb>[number]
    >(resolve => {
        jest.spyOn(
            TraceTaskBuilder.prototype,
            'withProgressCb',
        ).mockImplementationOnce(callback => {
            resolve(callback);
            return {} as TraceTaskBuilder;
        });
    });

export const getNrfmlCalledWithSinks = (sinks: string[]) => {
    const called = [];
    if (sinks.includes('raw')) {
        called.push(jest.spyOn(TraceTaskBuilder.prototype, 'withRawSink'));
    }
    if (sinks.includes('pcap')) {
        called.push(jest.spyOn(TraceTaskBuilder.prototype, 'withPcapSink'));
    }
    if (sinks.includes('live')) {
        called.push(
            jest.spyOn(TraceTaskBuilder.prototype, 'withWiresharkSink'),
        );
    }

    return called;
};

jest.mock('check-disk-space');

export const mockedCheckDiskSpace = checkDiskSpace as jest.MockedFunction<
    typeof checkDiskSpace
>;

export const mockedDataDir = '/mocked/data/dir';

jest.mock('@nordicsemiconductor/pc-nrfconnect-shared', () => ({
    ...jest.requireActual('@nordicsemiconductor/pc-nrfconnect-shared'),
    getAppDir: () => '/mocked/data/dir',
    getAppFile: () => '/mocked/data/dir',
    getAppDataDir: () => '/mocked/data/dir',
    getPersistentStore: jest.fn().mockImplementation(() => ({
        get: (_: unknown, defaultVal: unknown) => defaultVal,
        set: jest.fn(),
    })),
    currentPane: jest.fn().mockReturnValue(0),
}));
export const mockedCurrentPane = currentPane as jest.MockedFunction<
    typeof currentPane
>;

export const assertErrorWasLogged = () => {
    jest.spyOn(logger, 'error');
    return () => expect(logger.error).toHaveBeenCalled();
};

export const getMockStore = () => {
    const middlewares = [thunk];
    return configureMockStore<unknown, AppDispatch>(middlewares);
};

export const render = testUtils.render(appReducer);

export * from '@testing-library/react';
