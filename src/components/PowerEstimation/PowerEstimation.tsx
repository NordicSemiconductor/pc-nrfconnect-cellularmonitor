/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import InnerHTML from 'dangerously-set-html-content';
import { Alert, PaneProps, usageData } from 'pc-nrfconnect-shared';
import Plotly from 'plotly.js';

import {
    getRenderedHtml,
    hasError as powerEstimationError,
} from '../../features/powerEstimation/powerEstimationSlice';
import EventAction from '../../usageDataActions';

import './powerEstimation.scss';

export default ({ active }: PaneProps) => {
    const oppHtml = useSelector(getRenderedHtml);
    const hasError = useSelector(powerEstimationError);
    window.Plotly = Plotly;

    useEffect(() => {
        if (!active) return;
        usageData.sendUsageData(EventAction.POWER_ESTIMATION_PANE);
    }, [active]);

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
