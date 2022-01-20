/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import InnerHTML from 'dangerously-set-html-content';
import {
    Alert,
    currentPane as getCurrentPane,
    usageData,
} from 'pc-nrfconnect-shared';
import Plotly from 'plotly.js';

import {
    getRenderedHtml,
    hasError as powerEstimationError,
} from '../../features/powerEstimation/powerEstimationSlice';
import panes from '../../panes';
import EventAction from '../../usageDataActions';

import './powerEstimation.scss';

export default () => {
    const oppHtml = useSelector(getRenderedHtml);
    const hasError = useSelector(powerEstimationError);
    // @ts-expect-error -- this works, so not sure what ts expects here
    const currentPane = useSelector(getCurrentPane);

    const powerEstimationPane = panes.findIndex(
        pane => pane.name === 'Power Estimation'
    );

    window.Plotly = Plotly;

    useEffect(() => {
        if (currentPane !== powerEstimationPane) return;
        usageData.sendUsageData(EventAction.POWER_ESTIMATION_PANE);
    }, [currentPane, powerEstimationPane]);

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
