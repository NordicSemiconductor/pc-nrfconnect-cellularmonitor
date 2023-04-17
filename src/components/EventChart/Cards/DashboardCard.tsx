/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { useDispatch } from 'react-redux';
import { mdiPlayBox, mdiTextBox } from '@mdi/js';
import Icon from '@mdi/react';
import { Card, colors, openUrl } from 'pc-nrfconnect-shared';

import {
    ATCommands,
    documentationMap,
} from '../../../features/tracingEvents/at';
import {
    recommendedAT,
    sendRecommendedCommand,
} from '../../../features/tracingEvents/at/recommeneded';

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
}: CardTooltip) => {
    const dispatch = useDispatch();
    return (
        <Tooltip id={`tooltip-${fieldKey}`}>
            <div
                className="card-tooltip"
                onMouseEnter={() => showTooltip(true)}
                onMouseLeave={() => showTooltip(false)}
            >
                <h4>{fieldKey}</h4>
                {description !== undefined ? (
                    <p style={{ color: colors.gray100 }}>{description}</p>
                ) : null}
                {commands.length > 0 ? (
                    <>
                        <h4>RELATED COMMAND{commands.length > 1 ? 'S' : ''}</h4>
                        {commands.map((cmd, index) => (
                            <div
                                key={`${cmd}`}
                                style={{
                                    marginBottom: '16px',
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: '14px',
                                        marginBottom: '0',
                                    }}
                                >
                                    {cmd}
                                </p>

                                <div style={{ display: 'flex' }}>
                                    {cmd in recommendedAT ? (
                                        <span
                                            role="button"
                                            tabIndex={index}
                                            style={{
                                                marginRight: '8px',
                                                ...linkStyle,
                                            }}
                                            onClick={() =>
                                                dispatch(
                                                    sendRecommendedCommand(cmd)
                                                )
                                            }
                                            onKeyDown={event =>
                                                event.key === 'Enter'
                                                    ? dispatch(
                                                          sendRecommendedCommand(
                                                              cmd
                                                          )
                                                      )
                                                    : null
                                            }
                                        >
                                            <Icon
                                                style={{ marginRight: '4px' }}
                                                path={mdiPlayBox}
                                                size={0.6}
                                            />{' '}
                                            Run command{' '}
                                        </span>
                                    ) : null}
                                    <span
                                        role="button"
                                        tabIndex={index}
                                        style={linkStyle}
                                        onClick={() =>
                                            openUrl(documentationMap[cmd])
                                        }
                                        onKeyDown={event =>
                                            event.key === 'Enter'
                                                ? openUrl(documentationMap[cmd])
                                                : null
                                        }
                                    >
                                        <Icon
                                            style={{ marginRight: '4px' }}
                                            path={mdiTextBox}
                                            size={0.6}
                                        />{' '}
                                        Doc
                                    </span>
                                </div>
                            </div>
                        ))}
                    </>
                ) : null}
            </div>
        </Tooltip>
    );
};

const linkStyle: React.CSSProperties = {
    fontSize: '14px',
    color: colors.nordicBlue,
    display: 'flex',
    alignItems: 'center',
};
