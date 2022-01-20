/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App } from 'pc-nrfconnect-shared';

import appReducer from './appReducer';
import DeviceSelector from './components/DeviceSelector';
import DocumentationSections from './components/DocumentationSection';
import panes from './panes';
import logLibVersions from './utils/logLibVersions';

import './index.scss';

logLibVersions();

export default () => (
    <App
        reportUsageData
        appReducer={appReducer}
        deviceSelect={<DeviceSelector />}
        sidePanel={<div />}
        panes={panes}
        documentation={DocumentationSections}
    />
);
