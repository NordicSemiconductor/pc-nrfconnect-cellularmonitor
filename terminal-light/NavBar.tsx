/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ipcRenderer } from 'electron';

import './header.css';

export const Header = () => {
    return (
        <div className="header">
            <p>Terminal</p>
            <p>Connected to ...</p>
            <button type="button" onClick={closePopout}>
                Close separate terminal window
                <span className="mdi mdi-arrow-collapse" />
            </button>
        </div>
    );
};

export default Header;
