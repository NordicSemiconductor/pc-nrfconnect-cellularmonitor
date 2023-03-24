import React from 'react';
import { useSelector } from 'react-redux';
import { Group, selectedDevice } from 'pc-nrfconnect-shared';

import { LoadTraceFile } from './LoadTraceFile';
import TraceConverter from './Tracing/TraceConverter';

export default () => {
    const device = useSelector(selectedDevice);

    if (device) return null;

    return (
        <Group heading="FILE ACTIONS">
            <LoadTraceFile />
            <TraceConverter />
        </Group>
    );
};
