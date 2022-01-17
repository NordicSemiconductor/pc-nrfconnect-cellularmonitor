/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import InnerHTML from 'dangerously-set-html-content';
import { Alert, usageData } from 'pc-nrfconnect-shared';
import Plotly from 'plotly.js';

import {
    getRenderedHtml,
    hasError as powerEstimationError,
} from '../../features/powerEstimation/powerEstimationSlice';
import EventAction from '../../usageDataActions';
import { isPowerEstimationPane } from '../../utils/panes';

import './powerEstimation.scss';

export default () => {
    const oppHtml = useSelector(getRenderedHtml);
    const hasError = useSelector(powerEstimationError);
    const powerEstimationPane = useSelector(isPowerEstimationPane);

    window.Plotly = Plotly;

    useEffect(() => {
        if (!powerEstimationPane) return;
        usageData.sendUsageData(EventAction.POWER_ESTIMATION_PANE);
    }, [powerEstimationPane]);

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
