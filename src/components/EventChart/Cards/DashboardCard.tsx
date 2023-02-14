/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Card } from 'pc-nrfconnect-shared';

const DashboardCard: React.FC<{
    title: string;
    iconName?: string;
    information?: string;
    fields: Record<string, string | number>;
}> = ({
    title,
    iconName = 'mdi-border-none-variant',
    information = '',
    fields,
}) => (
    <Card
        title={
            <>
                <span className={`mdi ${iconName} icon`} />
                <span className="title">{title}</span>
                {information.length > 0 && (
                    <span className="mdi mdi-information-outline info-icon">
                        <span className="info">{information}</span>
                    </span>
                )}
            </>
        }
    >
        {Object.entries(fields).map(([key, value]) => (
            <li key={key}>
                <p className="card-key">{key}</p>
                <p className="card-value">{value}</p>
            </li>
        ))}
    </Card>
);

export default DashboardCard;
