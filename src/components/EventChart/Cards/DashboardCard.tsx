/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useRef, useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Card } from 'pc-nrfconnect-shared';

import {
    ATCommands,
    documentationMap,
} from '../../../features/tracingEvents/at';

export type DashboardCardFields = Record<string, DashboardCardField>;
export type DashboardCardField = {
    value: string | number;
    commands: readonly ATCommands[];
};

type DashboardCard = {
    title: string;
    iconName: string;
    information?: string;
    fields: DashboardCardFields;
};

export default ({
    title,
    iconName = 'mdi-border-none-variant',
    information = '',
    fields,
}: DashboardCard) => (
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
        {Object.entries(fields).map(([fieldKey, fieldValues]) => (
            <li key={fieldKey}>
                <CardEntry
                    fieldKey={fieldKey}
                    value={fieldValues.value}
                    commands={fieldValues.commands}
                />
            </li>
        ))}
    </Card>
);

type CardEntry = {
    fieldKey: string;
    value: string | number;
    commands: readonly ATCommands[];
};

const CardEntry = ({ fieldKey, value, commands }: CardEntry) => {
    const [keepShowing, setKeepShowing] = useState(false);
    const target = useRef(null);

    const showTooltip = (show: boolean) => setKeepShowing(show);

    return (
        <OverlayTrigger
            key={`overlay-${fieldKey}`}
            placement="right-start"
            overlay={CardTooltip({ fieldKey, commands, showTooltip })}
            show={keepShowing}
        >
            <div
                ref={target}
                className="card-entry"
                onMouseLeave={() => setKeepShowing(false)}
                onMouseEnter={() => setKeepShowing(true)}
            >
                <p className="card-key">{fieldKey}</p>
                <p className="card-value">{value}</p>
            </div>
        </OverlayTrigger>
    );
};

type CardTooltip = {
    fieldKey: string;
    commands: readonly ATCommands[];
    showTooltip: (show: boolean) => void;
};

const CardTooltip = ({ fieldKey, commands, showTooltip }: CardTooltip) => (
    <Tooltip id={`tooltip-${fieldKey}`}>
        <div
            className="card-tooltip"
            onMouseEnter={() => showTooltip(true)}
            onMouseLeave={() => showTooltip(false)}
        >
            <h4>{fieldKey}</h4>
            <p>AT commands:</p>
            <ul>
                {commands !== undefined
                    ? commands.map(cmd => (
                          // eslint-disable-next-line react/jsx-indent
                          <li key={`${cmd}`}>
                              <a href={documentationMap[cmd]}>{cmd}</a>
                          </li>
                      ))
                    : null}
            </ul>
        </div>
    </Tooltip>
);
