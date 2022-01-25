/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch } from 'react-redux';
import { openUrl, usageData } from 'pc-nrfconnect-shared';

import { WIRESHARK_DOWNLOAD_URL } from '../../features/wireshark/wireshark';
import { setTsharkPath } from '../../features/wireshark/wiresharkSlice';
import EventAction from '../../usageDataActions';
import { askForWiresharkPath } from '../../utils/fileUtils';

const SelectTshark: FC = ({ children }) => {
    const dispatch = useDispatch();

    const updateTsharkPath = () => {
        const selectedTsharkPath = askForWiresharkPath();
        if (selectedTsharkPath != null) {
            usageData.sendUsageData(EventAction.SET_TSHARK_PATH);
            dispatch(setTsharkPath(selectedTsharkPath));
        }
    };

    return (
        <Button
            onClick={updateTsharkPath}
            role="button"
            variant="secondary"
            className="tshark-btn"
        >
            {children}
        </Button>
    );
};

export const Tshark = () => {
    return (
        <div className="tshark">
            <h5>tshark not detected</h5>
            <span>
                tshark is required to get power parameters from network.
            </span>
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
};
