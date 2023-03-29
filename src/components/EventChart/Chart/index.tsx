/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import Chart from './Chart';

export default () => (
    <div className="chart">
        <div id="tooltip" />
        <Chart />
    </div>
);
