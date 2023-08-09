/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog,
    InfoDialog,
    StateSelector,
    Toggle,
    usageData,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import EventAction from '../../../usageDataActions';
import { EVENT_TYPES } from '../../tracing/formats';
import {
    changeTraceEventFilter,
    getMode,
    getTraceEventFilter,
    setShowOptionsDialog,
    showOptionsDialog,
    toggleMode,
} from './chartSlice';

export default () => {
    const dispatch = useDispatch();
    const isVisible = useSelector(showOptionsDialog);
    const traceEventFilter = useSelector(getTraceEventFilter);
    const mode = useSelector(getMode);
    return (
        <InfoDialog
            title="Chart Options"
            headerIcon="cog"
            isVisible={isVisible}
            onHide={() => dispatch(setShowOptionsDialog(false))}
        >
            <Dialog.Body>
                <StateSelector
                    items={['Event', 'Time']}
                    selectedItem={mode}
                    onSelect={() => {
                        dispatch(toggleMode());
                    }}
                />

                {EVENT_TYPES.map(type => (
                    <Toggle
                        key={type}
                        label={type}
                        isToggled={traceEventFilter.includes(type)}
                        onToggle={isToggled => {
                            usageData.sendUsageData(
                                EventAction.OPEN_CHART_OPTIONS
                            );
                            dispatch(
                                changeTraceEventFilter({
                                    type,
                                    enable: isToggled,
                                })
                            );
                        }}
                    />
                ))}
            </Dialog.Body>
        </InfoDialog>
    );
};
