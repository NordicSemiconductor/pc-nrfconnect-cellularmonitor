/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InfoDialog, Toggle } from 'pc-nrfconnect-shared';

import {
    getOpenInWiresharkSelected,
    getTraceFormats,
    setTraceFormats,
} from '../tracing/traceSlice';
import { WIRESHARK_DOWNLOAD_URL } from './wireshark';
import { SelectWireshark } from './WiresharkButton';

interface InstallWiresharkDialog {
    isVisible: boolean;
    setIsVisible: (isVisible: boolean) => void;
}
const InstallWiresharkDialog = ({
    isVisible,
    setIsVisible,
}: InstallWiresharkDialog) => {
    const dispatch = useDispatch();
    const traceFormats = useSelector(getTraceFormats);
    const openInWiresharkSelected = useSelector(getOpenInWiresharkSelected);

    const removeOpenInWireshark = () => {
        const traceFormatsWithoutWireshark = traceFormats.filter(
            format => format !== 'live'
        );
        dispatch(setTraceFormats(traceFormatsWithoutWireshark));
    };

    const addOpenInWireshark = () => {
        dispatch(setTraceFormats([...traceFormats, 'live']));
    };

    return (
        <InfoDialog
            title="Could not find Wireshark"
            isVisible={isVisible}
            onHide={() => setIsVisible(false)}
        >
            <p>
                Could not find Wireshark on your system, you have three options.
            </p>
            <div
                className="d-flex justify-content-between"
                style={{ gap: '4px' }}
            >
                <div className="border" style={cardStyle}>
                    <b className="mb-3">Option 1</b>
                    <div>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href={WIRESHARK_DOWNLOAD_URL}
                        >
                            Install Wireshark
                        </a>
                    </div>
                </div>
                <div className="border" style={cardStyle}>
                    <b className="mb-3">Option 2</b>
                    {process.platform === 'darwin' ||
                    process.platform === 'win32' ? (
                        <SelectWireshark>
                            Manually specify install path
                        </SelectWireshark>
                    ) : (
                        <p className="mb-0">Add Wireshark to your PATH</p>
                    )}
                </div>
                <div className="border" style={cardStyle}>
                    <b className="mb-3">Option 3</b>
                    <div>
                        Disable
                        <Toggle
                            label="Open in Wireshark"
                            isToggled={openInWiresharkSelected}
                            onToggle={
                                openInWiresharkSelected
                                    ? removeOpenInWireshark
                                    : addOpenInWireshark
                            }
                        />
                    </div>
                </div>
            </div>
        </InfoDialog>
    );
};

const cardStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'justify-content-between',
    padding: '8px',
    height: '128px',
};

export default InstallWiresharkDialog;
