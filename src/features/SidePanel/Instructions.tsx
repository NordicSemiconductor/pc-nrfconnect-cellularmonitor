/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Group } from '@nordicsemiconductor/pc-nrfconnect-shared';

import BuyDevelopmentkitDialog from '../buyDevelopmetKit/BuyDevelopmentkitDialog';
import { getIsDeviceSelected } from '../tracing/traceSlice';

export default () => {
    const isDeviceSelected = useSelector(getIsDeviceSelected);

    if (isDeviceSelected) {
        return null;
    }

    return (
        <Group heading="Instructions">
            <p>
                A Nordic Semiconductor cellular device is required to use this
                application.
            </p>

            <BuyDevelopmentkitDialog />
        </Group>
    );
};
