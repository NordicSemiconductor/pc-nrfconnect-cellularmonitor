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
import { Card, colors, openUrl, Toggle } from 'pc-nrfconnect-shared';

import { documentation } from '../../../../resources/docs/dashboardFields';
import { documentationMap } from '../../../features/tracingEvents/at';
import {
    commandHasRecommeneded,
    recommendedAT,
} from '../../../features/tracingEvents/at/recommeneded';
import { sendAT } from '../../../features/tracingEvents/at/sendCommand';
import { TDispatch } from '../../../utils/thunk';
import Copy from '../../Copy';

export type DashboardCardFields = Record<string, DashboardCardField>;
export type DashboardCardField = {
    value: string | number;
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
}: DashboardCard) => {
    const [hideUnknown, setHideUnknown] = useState(false);

    let fieldsToDisplay: typeof fields;

    if (hideUnknown) {
        fieldsToDisplay = Object.fromEntries(
            Object.entries(fields).filter(
                ([, fieldValue]) => fieldValue.value !== 'Unknown'
            )
        );
    } else {
        fieldsToDisplay = fields;
    }

    return (
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
                                        <span className="info">
                                            {information}
                                        </span>
                                    </Tooltip>
                                }
                            >
                                <span className="mdi mdi-information-outline info-icon" />
                            </OverlayTrigger>
                        )}
                    </>
                }
            >
                {Object.entries(fieldsToDisplay).map(
                    ([fieldKey, fieldValues]) => (
                        <li key={fieldKey}>
                            <CardEntry
                                fieldKey={fieldKey}
                                value={fieldValues.value}
                                title={title}
                            />
                        </li>
                    )
                )}

                <div
                    style={{
                        marginTop: '32px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Toggle
                        label="Hide Unknown"
                        isToggled={hideUnknown}
                        onToggle={() => setHideUnknown(!hideUnknown)}
                    />
                </div>
            </Card>
        </div>
    );
};

type CardEntry = {
    fieldKey: string;
    value: string | number;
    title: string;
};

const CardEntry = ({ fieldKey, value, title }: CardEntry) => {
    const dispatch = useDispatch();
    const [keepShowing, setKeepShowing] = useState(false);

    const showTooltip = (show: boolean) => setKeepShowing(show);

    const valueIsDefined = value !== 'Unknown';

    return (
        <div
            className="card-entry"
            onMouseEnter={() => {
                setKeepShowing(true);
            }}
            onMouseLeave={() => {
                setKeepShowing(false);
            }}
            style={{ display: 'flex', alignItems: 'center' }}
        >
            <div style={{ width: valueIsDefined ? '80%' : '100%' }}>
                <p>
                    <b>{fieldKey}</b> {value}
                </p>
            </div>
            {valueIsDefined ? <Copy data={`${value}`} size={0.6} /> : null}

            {keepShowing ? (
                <OverlayTrigger
                    key={`overlay-${fieldKey}`}
                    placement="bottom-end"
                    overlay={CardTooltip({
                        fieldKey,
                        title,
                        showTooltip,
                        dispatch,
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
    title: string;
    showTooltip: (show: boolean) => void;
    dispatch: TDispatch;
};

const CardTooltip = ({
    fieldKey,
    title,
    showTooltip,
    dispatch,
}: CardTooltip) => {
    const cardType = title.includes('PDN') ? 'Packet Domain Network' : title;
    const { commands, description } = documentation[cardType][fieldKey];

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
                                    {commandHasRecommeneded(cmd) ? (
                                        <span
                                            role="button"
                                            tabIndex={index}
                                            style={{
                                                marginRight: '8px',
                                                ...linkStyle,
                                            }}
                                            onClick={() => {
                                                const commandsToSend =
                                                    recommendedAT[cmd];
                                                if (commandsToSend) {
                                                    dispatch(
                                                        sendAT(commandsToSend)
                                                    );
                                                }
                                            }}
                                            onKeyDown={event => {
                                                if (event.key === 'Enter') {
                                                    const commandsToSend =
                                                        recommendedAT[cmd];
                                                    if (commandsToSend) {
                                                        dispatch(
                                                            sendAT(
                                                                commandsToSend
                                                            )
                                                        );
                                                    }
                                                }
                                            }}
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
