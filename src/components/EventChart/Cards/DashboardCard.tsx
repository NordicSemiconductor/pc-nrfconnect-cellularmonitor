/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import { Card } from 'pc-nrfconnect-shared';

const DashboardCard: React.FC<{
    onclick: () => void;
    title: string;
    iconName?: string;
    information?: string;
}> = ({
    onclick,
    title,
    iconName = 'mdi-border-none-variant',
    information = '',
    children,
}) => (
    <Card
        title={
            <>
                <span className={`mdi ${iconName} icon`} />
                <span className="title">{title}</span>
                {information.length && (
                    <span className="mdi mdi-information-outline info-icon">
                        <span className="info">{information}</span>
                    </span>
                )}
            </>
        }
    >
        {children}
        <Button variant="secondary" onClick={onclick} className="w-100">
            <span className="mdi mdi-reload" />
            Reload
        </Button>
    </Card>
);

export default DashboardCard;
