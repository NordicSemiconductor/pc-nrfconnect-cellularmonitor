/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch, useSelector } from 'react-redux';
import { openUrl } from 'pc-nrfconnect-shared';

import {
    getWiresharkPath,
    setWiresharkPath,
} from '../../features/tracing/traceSlice';
import { askForPcapFile, askForWiresharkPath } from '../../utils/fileUtils';
import { findWireshark, openInWireshark } from '../../utils/wireshark';

const WIRESHARK_DOWNLOAD_URL = 'https://www.wireshark.org/#download';

const SelectWireshark: FC = ({ children }) => {
    const dispatch = useDispatch();

    const updateWiresharkPath = () => {
        const selectedWiresharkPath = askForWiresharkPath();
        if (selectedWiresharkPath != null) {
            dispatch(setWiresharkPath(selectedWiresharkPath));
        }
    };

    return (
        <Button
            onClick={updateWiresharkPath}
            role="button"
            variant="link"
            className="card-links"
        >
            {children}
        </Button>
    );
};

export default () => {
    const selectedWiresharkPath = useSelector(getWiresharkPath);
    const wiresharkPath = findWireshark(selectedWiresharkPath);

    const loadPcap = () => {
        const filename = askForPcapFile();
        if (filename) {
            openInWireshark(filename, wiresharkPath);
        }
    };

    return (
        <div className="wireshark">
            {wiresharkPath != null ? (
                <>
                    <Button
                        className="w-100 secondary-btn"
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
                    <h6>Wireshark not found</h6>
                    <p>
                        You can{' '}
                        <Button
                            variant="link"
                            className="card-links"
                            onClick={() => openUrl(WIRESHARK_DOWNLOAD_URL)}
                        >
                            download and install Wireshark
                        </Button>{' '}
                        or{' '}
                        <SelectWireshark>select the executable</SelectWireshark>{' '}
                        if you already have it installed but in a location where
                        this app currently does not find it.
                    </p>
                </>
            )}
        </div>
    );
};
