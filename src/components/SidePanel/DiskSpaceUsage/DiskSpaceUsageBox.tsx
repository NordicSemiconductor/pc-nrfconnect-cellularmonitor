/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import prettyBytes from 'pretty-bytes';

type DiskSpaceUsageBoxProps = {
    label: string;
    value: number | undefined;
};

export default ({ label, value }: DiskSpaceUsageBoxProps) => (
    <div className="disk-space-box">
        <FormLabel>{label}</FormLabel>
        <span className="disk-space-value">
            {value !== undefined ? prettyBytes(value) : 'Loading'}
        </span>
    </div>
);
