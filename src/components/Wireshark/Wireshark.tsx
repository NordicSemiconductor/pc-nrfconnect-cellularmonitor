/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, openUrl, usageData } from 'pc-nrfconnect-shared';

import {
    findWireshark,
    openInWireshark,
    WIRESHARK_DOWNLOAD_URL,
} from '../../features/wireshark/wireshark';
import {
    getWiresharkPath,
    setWiresharkPath,
} from '../../features/wireshark/wiresharkSlice';
import EventAction from '../../usageDataActions';
import { askForPcapFile, askForWiresharkPath } from '../../utils/fileUtils';

import './wireshark.scss';

type WiresharkProps = {
    extendedDescription?: boolean;
};

const SelectWireshark: FC = ({ children }) => {
    const dispatch = useDispatch();

    const updateWiresharkPath = () => {
        const selectedWiresharkPath = askForWiresharkPath();
        if (selectedWiresharkPath != null) {
            usageData.sendUsageData(EventAction.SET_WIRESHARK_PATH);
            dispatch(setWiresharkPath(selectedWiresharkPath));
        }
    };

    return (
        <Button onClick={updateWiresharkPath} variant="link">
            {children}
        </Button>
    );
};

export default ({ extendedDescription = false }: WiresharkProps) => {
    const selectedWiresharkPath = useSelector(getWiresharkPath);
    const wiresharkPath = findWireshark(selectedWiresharkPath);
    const dispatch = useDispatch();

    const loadPcap = () => {
        const filename = askForPcapFile();
        if (filename) {
            usageData.sendUsageData(EventAction.OPEN_IN_WIRESHARK);
            dispatch(openInWireshark(filename));
        }
    };

    return (
        <div className="wireshark">
            {wiresharkPath != null ? (
                <>
                    <Button
                        className="w-100"
                        variant="secondary"
                        onClick={loadPcap}
                    >
                        Open in Wireshark
                    </Button>
                    <div className="w-100 mt-2 text-center">
                        <SelectWireshark>
                            Or select a different Wireshark executable
                        </SelectWireshark>
                    </div>
                </>
            ) : (
                <>
                    <h6>Wireshark not detected</h6>
                    <p>
                        {extendedDescription && (
                            <span>
                                Wireshark is required for live streaming trace
                                output.
                            </span>
                        )}
                        <Button
                            variant="link"
                            onClick={() => openUrl(WIRESHARK_DOWNLOAD_URL)}
                        >
                            Install Wireshark
                        </Button>{' '}
                        or manually{' '}
                        <SelectWireshark>specify install path</SelectWireshark>.
                    </p>
                </>
            )}
        </div>
    );
};
