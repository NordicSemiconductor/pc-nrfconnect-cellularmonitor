/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { isLoggingVerbose as getIsVerboseLogging } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { setNrfmlLogLevel } from '../app/monitorLibLogging';

/* This component is just a listener to the redux entry isVerboseLogging
 * in order to emit a setNrfmlLogLevel without needing to put it into
 * any other component.
 */

export default () => {
    const isVerboseLoggingFromShared = useSelector(getIsVerboseLogging);
    const [isVerboseLogging, setIsVerboseLogging] = useState(
        isVerboseLoggingFromShared
    );

    if (isVerboseLoggingFromShared !== isVerboseLogging) {
        setNrfmlLogLevel(isVerboseLoggingFromShared);
        setIsVerboseLogging(isVerboseLoggingFromShared);
    }

    return null;
};
