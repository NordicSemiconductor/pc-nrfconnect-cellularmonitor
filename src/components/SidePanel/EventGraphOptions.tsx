/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { useDispatch, useSelector } from 'react-redux';
import { Group, StateSelector } from 'pc-nrfconnect-shared';

import { EVENT_TYPES } from '../../features/tracing/formats';
import {
    changeTraceEventFilter,
    getMode,
    getTraceEventFilter,
    toggleMode,
} from '../EventChart/Chart/chartSlice';

import './sidepanel.scss';
import './Tracing/tracing.scss';

export default () => {
    const dispatch = useDispatch();
    const traceEventFilter = useSelector(getTraceEventFilter);
    const mode = useSelector(getMode);
    return (
        <Group heading="Event Graph Options">
            <StateSelector
                items={['Event', 'Time']}
                selectedItem={mode}
                onSelect={() => {
                    dispatch(toggleMode());
                }}
            />
            <ToggleButtonGroup className="event-types" type="checkbox">
                {EVENT_TYPES.map((type, i) => {
                    const isEnabled = traceEventFilter.includes(type);
                    return (
                        <ToggleButton
                            key={`d${i + 1}`}
                            checked={isEnabled}
                            variant={isEnabled ? 'set' : 'unset'}
                            className="event-type"
                            value={i}
                            onChange={event =>
                                dispatch(
                                    changeTraceEventFilter({
                                        type,
                                        enable: event.target.checked,
                                    })
                                )
                            }
                            active
                        >
                            {type}
                        </ToggleButton>
                    );
                })}
            </ToggleButtonGroup>
        </Group>
    );
};
