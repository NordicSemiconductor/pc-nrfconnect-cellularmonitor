import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { CollapsibleGroup, selectedDevice } from 'pc-nrfconnect-shared';

import { TraceFormat } from '../../features/tracing/formats';
import { getIsTracing } from '../../features/tracing/traceSlice';
import { getTraceFormats as getStoredTraceFormats } from '../../utils/store';
import DatabaseFileOverride from './DatabaseFileOverride';
import Serialports from './Serialports';
import TraceFormatSelector from './Tracing/TraceFormatSelector';

export default () => {
    const device = useSelector(selectedDevice);
    const [selectedTraceFormats, setSelectedTraceFormats] = useState<
        TraceFormat[]
    >(getStoredTraceFormats());
    const isTracing = useSelector(getIsTracing);

    if (!device) return null;

    return (
        <CollapsibleGroup heading="TRACE OPTIONS">
            <DatabaseFileOverride />

            <TraceFormatSelector
                selectedTraceFormats={selectedTraceFormats}
                setSelectedTraceFormats={setSelectedTraceFormats}
                isTracing={isTracing}
            />
            <Serialports />
        </CollapsibleGroup>
    );
};
