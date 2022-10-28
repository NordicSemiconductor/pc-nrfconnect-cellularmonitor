/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import { Card } from 'pc-nrfconnect-shared';

const DashboardCard: React.FC<{
    onclick: null | (() => void);
    title: string;
    iconName?: string;
    information?: string;
    fields: Record<string, string | number>;
}> = ({
    onclick,
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
        {onclick !== null && (
            <Button variant="secondary" onClick={onclick} className="w-100">
                <span className="mdi mdi-reload" />
                Reload
            </Button>
        )}
    </Card>
);

export default DashboardCard;
