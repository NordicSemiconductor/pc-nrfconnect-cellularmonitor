/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Group, StateSelector, Toggle } from 'pc-nrfconnect-shared';

import { EVENT_TYPES } from '../../features/tracing/formats';
import {
    changeTraceEventFilter,
    getGroupEvents,
    getMode,
    getTraceEventFilter,
    toggleGroupEvents,
    toggleMode,
} from '../EventChart/Chart/chartSlice';

import './sidepanel.scss';
import './Tracing/tracing.scss';

export default () => {
    const dispatch = useDispatch();
    const traceEventFilter = useSelector(getTraceEventFilter);
    const mode = useSelector(getMode);
    const groupEvents = useSelector(getGroupEvents);
    return (
        <Group heading="Event Graph Options">
            <StateSelector
                items={['Event', 'Time']}
                selectedItem={mode}
                onSelect={() => {
                    dispatch(toggleMode());
                }}
            />
            {mode === 'Event' && (
                <Toggle
                    label="Group events"
                    isToggled={groupEvents}
                    onToggle={() => dispatch(toggleGroupEvents())}
                />
            )}
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
        </Group>
    );
};
