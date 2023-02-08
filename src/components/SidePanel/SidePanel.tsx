/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Button,
    Card,
    openUrl,
    selectedDevice,
    SidePanel,
} from 'pc-nrfconnect-shared';

import { is91DK, isThingy91 } from '../Dashboard/flashSample';
import FlashSampleModal from '../Dashboard/FlashSampleModal';
import AdvancedOptions from './AdvancedOptions';
import EventGraphOptions from './EventGraphOptions';
import Instructions from './Instructions';
import { LoadTraceFile } from './LoadTraceFile';
import PowerEstimationParams from './PowerEstimationParams';
import TraceCollector from './Tracing/TraceCollector';
import TraceFileInformation from './Tracing/TraceFileInformation';

import './sidepanel.scss';
import './Tracing/tracing.scss';

export const PowerEstimationSidePanel = () => (
    <SidePanel>
        <PowerEstimationParams />
    </SidePanel>
);

export const TraceCollectorSidePanel = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const device = useSelector(selectedDevice);
    const compatible = device && (isThingy91(device) || is91DK(device));

    const close = useCallback(() => setModalVisible(false), []);
    return (
        <SidePanel className="side-panel">
            <Instructions />
            <TraceCollector />
            <TraceFileInformation />
            <AdvancedOptions />
            <LoadTraceFile />
            <EventGraphOptions />
            {compatible && (
                <Button
                    className="w-100"
                    onClick={() => setModalVisible(!modalVisible)}
                >
                    Program device
                </Button>
            )}
            <FlashSampleModal visible={modalVisible} close={close} />
        </SidePanel>
    );
};
