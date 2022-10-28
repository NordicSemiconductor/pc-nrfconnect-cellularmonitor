/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import { Button, CollapsibleGroup } from 'pc-nrfconnect-shared';

import { readRawTrace } from '../../features/tracing/nrfml';
import { askForTraceFile } from '../../utils/fileUtils';

export const LoadTraceFile = () => {
    const dispatch = useDispatch();

    const readRawFile = () => {
        const sourceFile = askForTraceFile();

        if (!sourceFile) {
            console.error('Could not select the provided file.');
            return;
        }
        dispatch(readRawTrace(sourceFile));
    };

    return (
        <CollapsibleGroup heading="Read Trace">
            <Button className="w-100 btn-sm" onClick={readRawFile}>
                Read Trace from Raw File
            </Button>
        </CollapsibleGroup>
    );
};
