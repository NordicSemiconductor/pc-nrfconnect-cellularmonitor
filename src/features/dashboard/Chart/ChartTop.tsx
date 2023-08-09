/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Toggle } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { getLive, setLive, setShowOptionsDialog } from './chartSlice';

export default ({ marginLeft }: { marginLeft: number }) => {
    const dispatch = useDispatch();
    const isLive = useSelector(getLive);
    return (
        <div
            className="chart-top d-flex align-items-center justify-content-between"
            style={{
                marginLeft: `${marginLeft}px`,
            }}
        >
            <p>Packet Event Viewer</p>
            <div className="d-flex justify-content-end flex-row">
                <Button
                    variant="primary"
                    onClick={() => dispatch(setShowOptionsDialog(true))}
                >
                    <span className="mdi mdi-cog" /> <p>SETTINGS</p>
                </Button>
                <Toggle
                    label="LIVE"
                    isToggled={isLive}
                    onToggle={isToggled => dispatch(setLive(isToggled))}
                    variant="primary"
                />
            </div>
        </div>
    );
};
