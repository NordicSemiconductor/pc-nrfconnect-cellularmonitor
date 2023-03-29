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
} from 'pc-nrfconnect-shared';

import { EVENT_TYPES } from '../../../features/tracing/formats';
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
            isVisible={isVisible}
            onClose={() => dispatch(setShowOptionsDialog(false))}
            title="Chart Options"
            headerIcon="cog"
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
                        onToggle={isToggled =>
                            dispatch(
                                changeTraceEventFilter({
                                    type,
                                    enable: isToggled,
                                })
                            )
                        }
                    />
                ))}
            </Dialog.Body>
        </InfoDialog>
    );
};
