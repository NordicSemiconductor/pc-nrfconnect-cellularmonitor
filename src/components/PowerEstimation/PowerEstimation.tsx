/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import InnerHTML from 'dangerously-set-html-content';
import { Alert, PaneProps, Spinner, usageData } from 'pc-nrfconnect-shared';
import Plotly from 'plotly.js';

import {
    OnlinePowerEstimatorParams,
    OPP_KEYS,
    postForm,
    updatePowerData,
} from '../../features/powerEstimation/onlinePowerEstimator';
import {
    getData,
    getIsLoading,
    getRenderedHtml,
    hasError as powerEstimationError,
    setRenderedHtml,
} from '../../features/powerEstimation/powerEstimationSlice';
import { getIsTracing } from '../../features/tracing/traceSlice';
import { findTshark } from '../../features/wireshark/wireshark';
import { getTsharkPath } from '../../features/wireshark/wiresharkSlice';
import EventAction from '../../usageDataActions';
import { Tshark } from '../Wireshark/Tshark';

import './powerEstimation.scss';

export default ({ active }: PaneProps) => {
    const dispatch = useDispatch();
    const oppData = useSelector(getData);
    const oppHtml = useSelector(getRenderedHtml);
    const hasError = useSelector(powerEstimationError);
    const isLoading = useSelector(getIsLoading);
    const isTracing = useSelector(getIsTracing);

    const selectedTsharkPath = useSelector(getTsharkPath);
    const isTsharkInstalled = !!findTshark(selectedTsharkPath);

    window.Plotly = Plotly;

    useEffect(() => {
        if (!active) return;
        usageData.sendUsageData(EventAction.POWER_ESTIMATION_PANE);
    }, [active]);

    const updatePowerEstimationData = useCallback(
        (key: keyof OnlinePowerEstimatorParams) => (event: Event) => {
            const target = event.target as HTMLInputElement;
            let { value } = target;
            if (target.type === 'checkbox') {
                value = target.checked ? 'on' : 'False';
            }
            dispatch(updatePowerData(key, value));
        },
        [dispatch]
    );

    const fetchOppHtml = useCallback(
        async (data: OnlinePowerEstimatorParams) => {
            const html = await postForm(data, dispatch);
            if (html) dispatch(setRenderedHtml(html));
        },
        [dispatch]
    );

    useEffect(() => {
        if (!oppData) return;
        fetchOppHtml(oppData);
    }, [oppData, fetchOppHtml]);

    useEffect(() => {
        if (!oppHtml) return;
        const oppForm = document.getElementsByClassName('opp-params-form')[0];
        if (!oppForm) return;
        oppForm.id = 'opp-params-form';
        const detailsContainer = document.getElementsByClassName(
            'details-box-container'
        )[0];
        if (detailsContainer) detailsContainer.id = 'general-information';
        const elementsAndHandlers = OPP_KEYS.map(key => {
            const element = document.getElementById(`id_${key}`);
            const handler = updatePowerEstimationData(key);
            element?.addEventListener('click', handler);
            return [element, handler] as const;
        });

        const helpBoxes = oppForm.getElementsByClassName(
            'help-box'
            // eslint-disable-next-line no-undef
        ) as HTMLCollectionOf<HTMLSpanElement>;
        [...helpBoxes].forEach((box: HTMLSpanElement) => {
            if (!box.dataset?.tip) return;
            box.title = box.dataset.tip;
        });

        const sliders = oppForm.querySelectorAll('input[type=range]');
        [...sliders].forEach(slider => slider?.parentElement?.remove());

        const textInputs = oppForm.querySelectorAll(
            'input[type=text]'
            // eslint-disable-next-line no-undef
        ) as NodeListOf<HTMLInputElement>;
        [...textInputs].forEach((input: HTMLInputElement) => {
            const idPattern = /id_(\w+)_val/;
            const matches = input?.id?.match(idPattern);
            if (!matches) return;
            const key = matches[1] as keyof OnlinePowerEstimatorParams;
            if (key) {
                const handler = updatePowerEstimationData(key);
                input.addEventListener('blur', handler);
                elementsAndHandlers.push([input, handler]);
            }
        });

        return () => {
            elementsAndHandlers.forEach(([element, handler]) => {
                element?.removeEventListener('click', handler);
            });
        };
    }, [oppHtml, updatePowerEstimationData]);

    const TSharkLanding = useMemo(
        () =>
            isTracing ? (
                <p>Waiting for power data to be available...</p>
            ) : (
                <p>
                    Start a trace to capture live data for power estimate or
                    read from existing trace file
                </p>
            ),
        [isTracing]
    );

    return (
        <div
            className={`power-estimation-container ${
                !oppHtml ? 'full-height' : ''
            }`}
        >
            {isLoading && (
                <div className="power-estimation-loading-container">
                    <div className="power-estimation-loading">
                        <Spinner />
                        <p>
                            Fetching data from Online Power Profiler, please
                            wait...
                        </p>
                    </div>
                </div>
            )}
            {hasError && (
                <Alert variant="danger" label="Error!">
                    Could not complete network request, see log for more
                    details.
                </Alert>
            )}
            {oppHtml ? (
                <>
                    <div className="power-estimation-navigation-bar">
                        <span>Scroll to: </span>
                        <Button
                            className="opp-nav-btn"
                            variant="secondary"
                            href="#general-information"
                        >
                            Information
                        </Button>
                        <Button
                            className="opp-nav-btn"
                            variant="secondary"
                            href="#opp-plot"
                        >
                            Chart
                        </Button>
                        <Button
                            className="opp-nav-btn"
                            variant="secondary"
                            href="#opp-params-form"
                        >
                            Settings
                        </Button>
                    </div>
                    <div className="opp-custom-html-container">
                        <InnerHTML html={oppHtml} />
                    </div>
                </>
            ) : (
                <div className="power-estimation-landing">
                    {isTsharkInstalled ? TSharkLanding : <Tshark />}
                </div>
            )}
        </div>
    );
};
