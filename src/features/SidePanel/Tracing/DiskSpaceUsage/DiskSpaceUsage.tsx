/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { getAppDataDir } from '@nordicsemiconductor/pc-nrfconnect-shared';
import checkDiskSpace from 'check-disk-space';

import DiskSpaceUsageBox from './DiskSpaceUsageBox';

import './diskspaceusage.scss';

export default () => {
    const [freeSpace, setFreeSpace] = useState<number | undefined>();
    const [totalSize, setTotalSize] = useState<number | undefined>();

    const checkDisk = () =>
        checkDiskSpace(getAppDataDir())
            .then(({ free, size }) => {
                setFreeSpace(free);
                setTotalSize(size);
            })
            .catch(err => console.log(err));

    useEffect(() => {
        checkDisk();
        const timerId = setInterval(() => {
            checkDisk();
        }, 5000);
        return () => {
            clearInterval(timerId);
        };
    }, []);

    return (
        <div className="disk-space-container">
            <DiskSpaceUsageBox label="Disk" value={totalSize} />
            <DiskSpaceUsageBox label="Free" value={freeSpace} />
        </div>
    );
};
