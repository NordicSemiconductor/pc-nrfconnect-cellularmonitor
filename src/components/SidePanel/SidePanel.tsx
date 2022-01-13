/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { SidePanel } from 'pc-nrfconnect-shared';

import { isPowerEstimationPane, isTraceCollectorPane } from '../../utils/panes';
import AdvancedOptions from './AdvancedOptions';
import Instructions from './Instructions';
import PowerEstimationParams from './PowerEstimationParams';
import TraceCollector from './Tracing/TraceCollector';
import TraceFileInformation from './Tracing/TraceFileInformation';

import './sidepanel.scss';
import './Tracing/tracing.scss';

export default () => {
    const traceCollectorPane = useSelector(isTraceCollectorPane);
    const powerEstimationPane = useSelector(isPowerEstimationPane);

    return (
        <SidePanel className="side-panel">
            {traceCollectorPane && (
                <>
                    <Instructions />
                    <TraceCollector />
                    <TraceFileInformation />
                    <AdvancedOptions />
                </>
            )}
            {powerEstimationPane && <PowerEstimationParams />}
        </SidePanel>
    );
};
