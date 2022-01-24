/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch, useSelector } from 'react-redux';
import { openUrl, usageData } from 'pc-nrfconnect-shared';

import {
    findTshark,
    WIRESHARK_DOWNLOAD_URL,
} from '../../features/wireshark/wireshark';
import {
    getTsharkPath,
    setTsharkPath,
} from '../../features/wireshark/wiresharkSlice';
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
            variant="link"
            className="card-links"
        >
            {children}
        </Button>
    );
};

export default () => {
    const selectedTsharkPath = useSelector(getTsharkPath);
    const tsharkPath = findTshark(selectedTsharkPath);

    if (tsharkPath != null) return;

    return (
        <div className="tshark">
            <h6>Tshark not detected</h6>
            <p>
                <span>
                    Tshark is required for to get power parameters from network.
                </span>
                <Button
                    variant="link"
                    className="card-links"
                    onClick={() => openUrl(WIRESHARK_DOWNLOAD_URL)}
                >
                    Install Tshark (via Wireshark)
                </Button>{' '}
                or manually <SelectTshark>specify install path</SelectTshark>.
            </p>
        </div>
    );
};
