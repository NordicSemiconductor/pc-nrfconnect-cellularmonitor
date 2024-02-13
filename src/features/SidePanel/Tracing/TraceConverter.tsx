/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, telemetry } from '@nordicsemiconductor/pc-nrfconnect-shared';

import EventAction from '../../../app/usageDataActions';
import { askForTraceFile } from '../../../common/fileUtils';
import { convertTraceFile } from '../../tracing/nrfml';
import { isWiresharkInstalled } from '../../wireshark/wireshark';

export default () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const enabled = isWiresharkInstalled();
    const title = enabled ? undefined : 'Install wireshark to use this feature';

    const loadTrace = async () => {
        const filePath = await askForTraceFile();
        if (filePath) {
            telemetry.sendEvent(EventAction.OPEN_TRACE_IN_WIRESHARK);
            dispatch(convertTraceFile(filePath, setLoading));
        }
    };

    return (
        <Button
            className={`w-100 ${loading && 'active-animation'}`}
            onClick={loadTrace}
            disabled={loading || !enabled}
            variant="secondary"
            title={title}
        >
            {loading === true
                ? 'Opening file...'
                : 'Open trace file in Wireshark...'}
        </Button>
    );
};
