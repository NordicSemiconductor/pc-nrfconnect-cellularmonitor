/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import DashboardCards from './Cards';
import { getMode } from './Chart/chartSlice';
import EventChart from './Chart/EventChart';
import TimeChart from './Chart/TimeChart';

import './Dashboard.scss';

const Dashboard = () => {
    const mode = useSelector(getMode);
    return (
        <div className="events-container">
            <DashboardCards />

            <div>
                <div id="tooltip" />
                {mode === 'Event' && <EventChart />}
                {mode === 'Time' && <TimeChart />}
            </div>
        </div>
    );
};

export default Dashboard;
