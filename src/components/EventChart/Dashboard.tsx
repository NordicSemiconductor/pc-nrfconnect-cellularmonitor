/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import DashboardCards from './Cards';
import Chart from './Chart/Chart';

import './Dashboard.scss';

const Dashboard = () => (
    <div className="events-container">
        <DashboardCards />

        <div>
            <div id="tooltip" />
            <Chart />
        </div>
    </div>
);

export default Dashboard;
