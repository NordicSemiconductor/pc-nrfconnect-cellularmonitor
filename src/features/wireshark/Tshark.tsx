/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { Button, openUrl, usageData } from 'pc-nrfconnect-shared';

import EventAction from '../../usageDataActions';
import { askForWiresharkPath } from '../../utils/fileUtils';
import { WIRESHARK_DOWNLOAD_URL } from './wireshark';
import { setTsharkPath } from './wiresharkSlice';

const SelectTshark: FC = ({ children }) => {
    const dispatch = useDispatch();

    const updateTsharkPath = async () => {
        const filePath = await askForWiresharkPath();
        if (filePath) {
            usageData.sendUsageData(EventAction.SET_TSHARK_PATH);
            dispatch(setTsharkPath(filePath));
        }
    };

    return (
        <Button
            onClick={updateTsharkPath}
            variant="secondary"
            className="tshark-btn"
        >
            {children}
        </Button>
    );
};

export const Tshark = () => (
    <div className="tshark">
        <h5>tshark not detected</h5>
        <span>tshark is required to get power parameters from network.</span>
        <Button
            variant="secondary"
            className="tshark-btn"
            onClick={() => openUrl(WIRESHARK_DOWNLOAD_URL)}
        >
            Install tshark (via Wireshark)
        </Button>
        <SelectTshark>Specify install path</SelectTshark>.
    </div>
);
