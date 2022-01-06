/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml from '@nordicsemiconductor/nrf-monitor-lib-js';
// eslint-disable-next-line import/no-unresolved
import { Configuration } from '@nordicsemiconductor/nrf-monitor-lib-js/config/configuration';
import checkDiskSpace from 'check-disk-space';
import { logger, testUtils } from 'pc-nrfconnect-shared';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import appReducer from '../appReducer';
import { TDispatch } from '../thunk';

type CallbackName = 'complete' | 'progress' | 'data' | 'json';

type CallbackType<T> = T extends 'complete'
    ? nrfml.CompleteCallback
    : T extends 'progress'
    ? nrfml.ProgressCallback
    : T extends 'data'
    ? nrfml.DataCallback
    : T extends 'json'
    ? nrfml.JsonCallback
    : never;

export function getNrfmlCallback<T extends CallbackName>(
    callbackType: T
): Promise<CallbackType<T>> {
    let callback: CallbackType<T>;
    return new Promise(resolve => {
        // @ts-ignore -- ts doesn't understand that nrfml.start is a mock fn
        nrfml.start.mockImplementationOnce(
            (
                _: Configuration,
                completeCb: nrfml.CompleteCallback,
                progressCb: nrfml.ProgressCallback,
                dataCb: nrfml.DataCallback,
                jsonCb: nrfml.JsonCallback
            ) => {
                switch (callbackType) {
                    case 'complete':
                        callback = completeCb as CallbackType<T>;
                        break;
                    case 'progress':
                        callback = progressCb as CallbackType<T>;
                        break;
                    case 'data':
                        callback = dataCb as CallbackType<T>;
                        break;
                    case 'json':
                        callback = jsonCb as CallbackType<T>;
                        break;
                }
                resolve(callback);
                return 1; // mocked task id
            }
        );
    });
}

jest.mock('check-disk-space');

export const mockedCheckDiskSpace = checkDiskSpace as jest.MockedFunction<
    typeof checkDiskSpace
>;

export const mockedDataDir = '/mocked/data/dir';

jest.mock('pc-nrfconnect-shared', () => ({
    ...jest.requireActual('pc-nrfconnect-shared'),
    getAppDir: () => '/mocked/data/dir',
    getAppDataDir: () => '/mocked/data/dir',
    getPersistentStore: jest.fn().mockImplementation(() => ({
        get: (_: unknown, defaultVal: unknown) => defaultVal,
        set: jest.fn(),
    })),
}));

export const assertErrorWasLogged = () => {
    jest.spyOn(logger, 'error');
    return () => expect(logger.error).toHaveBeenCalled();
};

export const getMockStore = () => {
    const middlewares = [thunk];
    return configureMockStore<unknown, TDispatch>(middlewares);
};

export const render = testUtils.render(appReducer);

export * from '@testing-library/react';
