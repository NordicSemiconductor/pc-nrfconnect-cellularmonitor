/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Group, openUrl } from 'pc-nrfconnect-shared';

import { getIsDeviceSelected } from '../../features/tracing/traceSlice';

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
            <Button
                onClick={() =>
                    openUrl(
                        'https://www.nordicsemi.com/About-us/BuyOnline?search_token=nrf9160-DK&series_token=nRF9160'
                    )
                }
                variant="secondary"
                className="w-100"
            >
                Buy development kit...
            </Button>
        </Group>
    );
};
