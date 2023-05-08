/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { InfoDialog } from 'pc-nrfconnect-shared';

import { WIRESHARK_DOWNLOAD_URL } from '../features/wireshark/wireshark';
import { SelectWireshark } from './Wireshark/Wireshark';

interface InstallWiresharkDialog {
    isVisible: boolean;
    setIsVisible: (isVisible: boolean) => void;
}
const InstallWiresharkDialog = ({
    isVisible,
    setIsVisible,
}: InstallWiresharkDialog) => (
    <InfoDialog
        title="Could not find Wireshark"
        isVisible={isVisible}
        onHide={() => setIsVisible(false)}
    >
        <p>
            Could not find Wireshark on your system, you have three options to
            proceed.
        </p>
        <ol>
            <li>
                <a
                    rel="noreferrer"
                    target="_blank"
                    href={WIRESHARK_DOWNLOAD_URL}
                >
                    Install Wireshark
                </a>
            </li>
            {process.platform === 'darwin' || process.platform === 'win32' ? (
                <li>
                    <SelectWireshark>
                        Manually set wireshark path
                    </SelectWireshark>
                </li>
            ) : (
                <li>Add Wiershark to your PATH</li>
            )}
            <li> Start Trace without `Open in Wireshark`</li>
        </ol>
    </InfoDialog>
);

export default InstallWiresharkDialog;
