/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import DashboardCards from './Cards';
import Chart from './Chart';

import './Dashboard.scss';

const Dashboard = () => (
    <div className="events-container">
        <div className="events-dashboard-cards">
            <DashboardCards />
        </div>
        <Chart />
    </div>
);

export default Dashboard;
