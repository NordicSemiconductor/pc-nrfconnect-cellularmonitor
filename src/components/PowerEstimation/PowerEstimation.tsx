/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import InnerHTML from 'dangerously-set-html-content';
import { Alert } from 'pc-nrfconnect-shared';
import Plotly from 'plotly.js';

import {
    errorOccured,
    getRenderedHtml,
} from '../../features/powerEstimation/powerEstimationSlice';

import './powerEstimation.scss';

export default () => {
    const oppHtml = useSelector(getRenderedHtml);
    const hasError = useSelector(errorOccured);

    window.Plotly = Plotly;

    return (
        <div className="power-estimation-container">
            {hasError && (
                <Alert variant="danger" label="Error!">
                    Could not complete network request, see log for more
                    details.
                </Alert>
            )}
            {oppHtml ? (
                <InnerHTML html={oppHtml} />
            ) : (
                <div className="power-estimation-landing">
                    Start a trace to capture live power estimate or read from
                    existing trace file
                </div>
            )}
        </div>
    );
};
