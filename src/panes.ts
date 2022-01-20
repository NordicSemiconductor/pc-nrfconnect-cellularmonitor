/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Dashboard from './components/Dashboard/Dashboard';
import PowerEstimation from './components/PowerEstimation/PowerEstimation';
import {
    PowerEstimationSidePanel,
    TraceCollectorSidePanel,
} from './components/SidePanel/SidePanel';

export default [
    {
        name: 'Trace Collector',
        Main: Dashboard,
        SidePanel: TraceCollectorSidePanel,
    },
    {
        name: 'Power Estimation',
        Main: PowerEstimation,
        SidePanel: PowerEstimationSidePanel,
    },
];
