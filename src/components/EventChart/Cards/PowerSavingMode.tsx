/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion -- Because filter on Object.entries does not properly hide undefined values on TS. */

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card } from 'pc-nrfconnect-shared';

import { getPowerSavingMode } from '../../../features/tracingEvents/dashboardSlice';
import { PowerSavingModeValues } from '../../../features/tracingEvents/types';

const formatPSMValuesToString = (values: PowerSavingModeValues): string => {
    if (values.unit && values.value) {
        return `${values.value} ${values.unit} = ${values.bitmask}`;
    }
    return `${values.bitmask}`;
};

export default () => {
    const { requested, granted } = useSelector(getPowerSavingMode) ?? {
        requested: undefined,
        granted: undefined,
    };

    const requestedFields = useMemo(() => {
        if (!requested) return;

        return {
            'Periodic TAU': requested.T3412_extended ?? undefined,
            'Active Timer': requested.T3324 ?? undefined,

            // Could be displayed if user toggles an Advanced option?
            // 'T3324 Extended': requested.T3324_extended ?? undefined,
            // T3402: requested.T3402 ?? undefined,
            // 'T3402 Extended': requested.T3402_extended ?? undefined,
            // T3412: requested.T3412 ?? undefined,
        };
    }, [requested]);

    const grantedFields = useMemo(() => {
        if (!granted) return;

        return {
            'Periodic TAU': granted.T3412_extended ?? undefined,
            'Active Timer': granted.T3324 ?? undefined,

            // Could be displayed if user toggles an Advanced option?
            // 'T3324 Extended': granted.T3324_extended ?? undefined,
            // T3402: granted.T3402 ?? undefined,
            // 'T3402 Extended': granted.T3402_extended ?? undefined,
            // T3412: granted.T3412 ?? undefined,
        };
    }, [granted]);

    return (
        <Card
            title={
                <>
                    <span className="mdi mdi-lightning-bolt-circle icon" />
                    <span className="title">Power Saving Mode</span>
                </>
            }
        >
            {requested !== undefined ? (
                <>
                    <h4>Requested Parameters</h4>
                    {requestedFields &&
                        Object.entries(requestedFields)
                            .filter(([, value]) => value !== undefined)
                            .map(([key, value]) => (
                                <li key={key}>
                                    <p className="card-key">{key}</p>
                                    <p className="card-value">
                                        {formatPSMValuesToString(value!)}
                                    </p>
                                </li>
                            ))}
                </>
            ) : null}
            {granted !== undefined ? (
                <>
                    <h4>Granted Parameters</h4>
                    {grantedFields &&
                        Object.entries(grantedFields)
                            .filter(([, value]) => value !== undefined)
                            .map(([key, value]) => (
                                <li key={key}>
                                    <p className="card-key">{key}</p>
                                    <p className="card-value">
                                        {formatPSMValuesToString(value!)}
                                    </p>
                                </li>
                            ))}
                </>
            ) : null}
        </Card>
    );
};
