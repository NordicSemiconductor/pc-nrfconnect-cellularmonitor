/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import ConvertTraceCard from './ConvertTraceCard';
import CreateTraceCard from './CreateTraceCard';
import FeedbackCard from './FeedbackCard';
import Toast from './Toast/Toast';

import './dashboard.scss';

export default () => (
    <div className="dashboard-container">
        <div className="dashboard">
            <Toast label="Experimental release!">
                This is an unsupported, experimental preview and it is subject
                to major redesigns in the future.
            </Toast>
            <div className="dashboard-cards">
                <CreateTraceCard />
                <ConvertTraceCard />
                <FeedbackCard />
            </div>
        </div>
    </div>
);
