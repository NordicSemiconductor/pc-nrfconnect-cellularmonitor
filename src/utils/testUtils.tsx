/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import checkDiskSpace from 'check-disk-space';
import { testUtils } from 'pc-nrfconnect-shared';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import appReducer from '../appReducer';
import { TDispatch } from '../thunk';

jest.mock('check-disk-space');

const mockedCheckDiskSpace = checkDiskSpace as jest.MockedFunction<
    typeof checkDiskSpace
>;

const mockedDataDir = '/mocked/data/dir';

jest.mock('pc-nrfconnect-shared', () => ({
    ...jest.requireActual('pc-nrfconnect-shared'),
    getAppDir: () => '/mocked/data/dir',
    getAppDataDir: () => '/mocked/data/dir',
    getPersistentStore: jest.fn().mockImplementation(() => ({
        get: (_: unknown, defaultVal: unknown) => defaultVal,
        set: jest.fn(),
    })),
}));

const getMockStore = () => {
    const middlewares = [thunk];
    return configureMockStore<unknown, TDispatch>(middlewares);
};

const render = testUtils.render(appReducer);

export * from '@testing-library/react';
export { render, getMockStore, mockedCheckDiskSpace, mockedDataDir };
