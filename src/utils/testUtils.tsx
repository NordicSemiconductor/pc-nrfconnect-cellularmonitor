/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { Provider } from 'react-redux';
import { render, RenderOptions } from '@testing-library/react';
import checkDiskSpace from 'check-disk-space';
import deviceReducer from 'pc-nrfconnect-shared/src/Device/deviceReducer';
import {
    AnyAction,
    applyMiddleware,
    combineReducers,
    createStore,
} from 'redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import reducer from '../reducers';
import { TDispatch } from '../thunk';

jest.mock('check-disk-space');

const mockedCheckDiskSpace = checkDiskSpace as jest.MockedFunction<
    typeof checkDiskSpace
>;

const mockedDataDir = '/mocked/data/dir';

jest.mock('pc-nrfconnect-shared', () => {
    return {
        ...jest.requireActual('pc-nrfconnect-shared'),
        getAppDir: () => '/mocked/data/dir',
        getAppDataDir: () => '/mocked/data/dir',
        getPersistentStore: jest.fn().mockImplementation(() => ({
            get: (_: unknown, defaultVal: unknown) => defaultVal,
            set: jest.fn(),
        })),
    };
});

const getMockStore = () => {
    const middlewares = [thunk];
    return configureMockStore<unknown, TDispatch>(middlewares);
};

const createPreparedStore = (actions: AnyAction[]) => {
    const store = createStore(
        combineReducers({ device: deviceReducer, app: reducer }),
        applyMiddleware(thunk)
    );
    actions.forEach(store.dispatch);

    return store;
};

const customRender = (
    element: React.ReactElement,
    actions: AnyAction[] = [],
    options: RenderOptions = {}
) => {
    const Wrapper: FC = props => {
        return <Provider store={createPreparedStore(actions)} {...props} />;
    };
    return render(element, { wrapper: Wrapper, ...options });
};

export * from '@testing-library/react';
export {
    customRender as render,
    getMockStore,
    mockedCheckDiskSpace,
    mockedDataDir,
};
