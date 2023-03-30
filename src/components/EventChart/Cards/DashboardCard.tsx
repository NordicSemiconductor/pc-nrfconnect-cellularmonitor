/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Card, openUrl } from 'pc-nrfconnect-shared';

import {
    ATCommands,
    documentationMap,
} from '../../../features/tracingEvents/at';

export type DashboardCardFields = Record<string, DashboardCardField>;
export type DashboardCardField = {
    value: string | number;
    description?: string;
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
    <div>
        <Card
            title={
                <>
                    <span className={`mdi ${iconName} icon`} />
                    <span className="title">{title}</span>
                    {information.length > 0 && (
                        <OverlayTrigger
                            key={`overlay-${title}`}
                            placement="bottom-end"
                            overlay={
                                <Tooltip id={`tooltip-${title}`}>
                                    <span className="info">{information}</span>
                                </Tooltip>
                            }
                        >
                            <span className="mdi mdi-information-outline info-icon" />
                        </OverlayTrigger>
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
                        description={fieldValues.description}
                    />
                </li>
            ))}
        </Card>
    </div>
);

type CardEntry = {
    fieldKey: string;
    value: string | number;
    commands: readonly ATCommands[];
    description?: string;
};

const CardEntry = ({ fieldKey, value, commands, description }: CardEntry) => {
    const [keepShowing, setKeepShowing] = useState(false);

    const showTooltip = (show: boolean) => setKeepShowing(show);

    return (
        <div
            className="card-entry"
            onMouseEnter={() => {
                setKeepShowing(true);
            }}
            onMouseLeave={() => {
                setKeepShowing(false);
            }}
        >
            <p className="card-key">{fieldKey}</p>
            <p className="card-value">{value}</p>

            {keepShowing ? (
                <OverlayTrigger
                    key={`overlay-${fieldKey}`}
                    placement="bottom-end"
                    overlay={CardTooltip({
                        fieldKey,
                        description,
                        commands,
                        showTooltip,
                    })}
                    show={keepShowing}
                >
                    <div className="tooltip-helper" />
                </OverlayTrigger>
            ) : null}
        </div>
    );
};

type CardTooltip = {
    fieldKey: string;
    description?: string;
    commands: readonly ATCommands[];
    showTooltip: (show: boolean) => void;
};

const CardTooltip = ({
    fieldKey,
    description,
    commands,
    showTooltip,
}: CardTooltip) => (
    <Tooltip id={`tooltip-${fieldKey}`}>
        <div
            className="card-tooltip"
            onMouseEnter={() => showTooltip(true)}
            onMouseLeave={() => showTooltip(false)}
        >
            <h4>{fieldKey}</h4>
            {description !== undefined ? (
                <>
                    <h3>Description</h3>
                    <p>{description}</p>
                </>
            ) : null}
            {commands.length > 0 ? (
                <>
                    <p>AT commands:</p>
                    <ul>
                        {commands !== undefined
                            ? commands.map((cmd, index) => (
                                  <li key={`${cmd}`}>
                                      <span
                                          onClick={() =>
                                              openUrl(documentationMap[cmd])
                                          }
                                          onKeyDown={e => {
                                              if (e.key === 'Enter')
                                                  openUrl(
                                                      documentationMap[cmd]
                                                  );
                                          }}
                                          role="button"
                                          tabIndex={index}
                                      >
                                          {cmd}
                                      </span>
                                  </li>
                              ))
                            : null}
                    </ul>
                </>
            ) : null}
        </div>
    </Tooltip>
);
