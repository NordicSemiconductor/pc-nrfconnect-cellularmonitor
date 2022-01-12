/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import InnerHTML from 'dangerously-set-html-content';
import Plotly from 'plotly.js';

import {
    errorOccured,
    getRenderedHtml,
} from '../../features/powerEstimation/powerEstimationSlice';

import './powerEstimation.scss';

export default () => {
    const html = useSelector(getRenderedHtml);
    const hasError = useSelector(errorOccured);

    if (hasError) {
        return (
            <div>
                <p className="power-estimation-error">An error occured</p>
            </div>
        );
    }
    if (!html) {
        return (
            <div className="power-estimation-loading">
                Start a trace to capture live power estimate
            </div>
        );
    }

    window.Plotly = Plotly;

    return (
        <div className="power-estimation-container">
            <InnerHTML html={html} />
        </div>
    );
};
