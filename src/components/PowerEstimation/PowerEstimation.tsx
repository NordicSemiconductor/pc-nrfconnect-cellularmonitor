/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InnerHTML from 'dangerously-set-html-content';
import { Alert, PaneProps, usageData } from 'pc-nrfconnect-shared';
import Plotly from 'plotly.js';

import {
    OnlinePowerEstimatorParams,
    OPP_KEYS,
    updatePowerData,
} from '../../features/powerEstimation/onlinePowerEstimator';
import {
    getRenderedHtml,
    hasError as powerEstimationError,
} from '../../features/powerEstimation/powerEstimationSlice';
import { findTshark } from '../../features/wireshark/wireshark';
import { getTsharkPath } from '../../features/wireshark/wiresharkSlice';
import EventAction from '../../usageDataActions';
import { Tshark } from '../Wireshark/Tshark';

import './powerEstimation.scss';

export default ({ active }: PaneProps) => {
    const dispatch = useDispatch();
    const oppHtml = useSelector(getRenderedHtml);
    const hasError = useSelector(powerEstimationError);

    const selectedTsharkPath = useSelector(getTsharkPath);
    const isTsharkInstalled = !!findTshark(selectedTsharkPath);

    window.Plotly = Plotly;

    useEffect(() => {
        if (!active) return;
        usageData.sendUsageData(EventAction.POWER_ESTIMATION_PANE);
    }, [active]);

    const updatePowerEstimationData =
        (key: keyof OnlinePowerEstimatorParams) => (event: Event) => {
            const target = event.target as HTMLInputElement;
            let { value } = target;
            if (target.type === 'checkbox') {
                value = target.checked ? 'on' : 'False';
            }
            dispatch(updatePowerData(key, value));
        };

    useEffect(() => {
        if (!oppHtml) return;

        const elementsAndHandlers = OPP_KEYS.map(key => {
            const element = document.getElementById(`id_${key}`);
            const handler = updatePowerEstimationData(key);
            element?.addEventListener('click', handler);
            return [element, handler] as const;
        });

        return () => {
            elementsAndHandlers.forEach(([element, handler]) => {
                element?.removeEventListener('click', handler);
            });
        };
    }, [oppHtml]);

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
                    {isTsharkInstalled ? (
                        <p>
                            Start a trace to capture live data for power
                            estimate or read from existing trace file
                        </p>
                    ) : (
                        <Tshark />
                    )}
                </div>
            )}
        </div>
    );
};
