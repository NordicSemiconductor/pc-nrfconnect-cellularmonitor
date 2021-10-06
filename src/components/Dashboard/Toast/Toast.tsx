/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import Alert from 'react-bootstrap/Alert';

import './toast.scss';

type ToastProps = {
    label?: string;
};

const Toast: FC<ToastProps> = ({ children, label }) => {
    return (
        <Alert variant="info" className="toast-container">
            {label && <span className="toast-label">{label}</span>}
            <span>{children}</span>
        </Alert>
    );
};

export default Toast;
