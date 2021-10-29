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
    variant?:
        | 'primary'
        | 'secondary'
        | 'success'
        | 'danger'
        | 'warning'
        | 'info'
        | 'light'
        | 'dark';
};

const Toast: FC<ToastProps> = ({ children, label, variant = 'info' }) => {
    return (
        <Alert variant={variant} className="toast-container">
            {label && <span className="toast-label">{label}</span>}
            <span>{children}</span>
        </Alert>
    );
};

export default Toast;
