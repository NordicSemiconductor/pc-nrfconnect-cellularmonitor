/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import Chart from './Chart';
import ChartOptionsDialog from './ChartOptionsDialog';

import './chart.scss';

export default () => (
    <div className="chart">
        <Chart />
        <ChartOptionsDialog />
    </div>
);
