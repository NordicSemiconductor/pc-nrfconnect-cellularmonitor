/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { SidePanel } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { OpenSerialTerminal } from '../terminal';
import AdvancedOptions from './AdvancedOptions';
import ConnectionStatus from './ConnectionStatus';
import FileActions from './FileActions';
import Instructions from './Instructions';
import { Recommended } from './Macros';
import TraceOptions from './TraceOptions';
import TraceCollector from './Tracing/TraceCollector';

import './sidepanel.scss';
import './Tracing/tracing.scss';
import {useSelector} from "react-redux";
import {getTraceSerialPort} from "../tracing/traceSlice";
import {serialPort} from "@nordicsemiconductor/pc-nrfconnect-shared/typings/generated/main";

export const TraceCollectorSidePanel = () => {

    const selectedSerialPort = useSelector(getTraceSerialPort);

    return (
        <SidePanel className="side-panel">
            <Instructions/>
            <FileActions/>

            {
                selectedSerialPort && (
                    <>
                        <div className="tw-flex tw-flex-col tw-gap-2">
                            <TraceCollector/>
                        </div>
                        <div className="tw-flex tw-flex-col tw-gap-2">
                            <Recommended/>
                            <OpenSerialTerminal/>
                        </div>
                    </>
                )
            }

            <ConnectionStatus/>
            <TraceOptions/>
            <AdvancedOptions/>
        </SidePanel>
    )
}
