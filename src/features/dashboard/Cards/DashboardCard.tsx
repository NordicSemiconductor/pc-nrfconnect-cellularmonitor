/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { useDispatch, useSelector } from 'react-redux';
import { mdiPlayBox, mdiTextBox } from '@mdi/js';
import Icon from '@mdi/react';
import { clipboard } from 'electron';
import {
    Card,
    colors,
    newCopiedFlashMessage,
    openUrl,
} from 'pc-nrfconnect-shared';

import { documentation } from '../../../../resources/docs/dashboardFields';
import {
    getDetectedAtHostLibrary,
    getIsTracing,
} from '../../tracing/traceSlice';
import { documentationMap } from '../../tracingEvents/at';
import {
    commandHasRecommeneded,
    recommendedAT,
} from '../../tracingEvents/at/recommeneded';
import { sendAT } from '../../tracingEvents/at/sendCommand';

import './DashboardCard.css';

export type DashboardCardFields = Record<string, DashboardCardField>;
export type DashboardCardField = {
    value: string | number;
    conditionalStyle?: React.CSSProperties;
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
                    {title}
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
                        title={title}
                        style={fieldValues.conditionalStyle}
                    />
                </li>
            ))}
        </Card>
    </div>
);

type CardEntry = {
    fieldKey: string;
    value: string | number;
    title: string;
    style?: React.CSSProperties;
};

const isCopiable = (value: string | number) => value !== 'Unknown';

const CardEntry = ({ fieldKey, value, title, style }: CardEntry) => {
    const dispatch = useDispatch();
    const [showTooltip, setShowTooltip] = useState(false);

    const fieldRef = useRef<HTMLDivElement>(null);
    const fieldValueRef = useRef<HTMLParagraphElement>(null);
    const oldValue = useRef<string | number | null>(null);

    useEffect(() => {
        if (style?.animation) {
            return;
        }
        if (
            value !== oldValue.current &&
            oldValue.current &&
            fieldRef.current
        ) {
            fieldRef.current?.classList.remove('animated-card-entry');
            setTimeout(() =>
                fieldRef?.current?.classList.add('animated-card-entry')
            );
        }
        oldValue.current = value;
    }, [style?.animation, value]);

    const showCopiable = (copiable: boolean) => {
        if (copiable) {
            fieldValueRef.current?.classList.add('copiable');
        } else {
            fieldValueRef.current?.classList.remove('copiable');
        }
    };

    const copyFieldValue = () => {
        if (isCopiable(value)) {
            clipboard.writeText(value.toString());
            dispatch(newCopiedFlashMessage());
            showCopiable(false);
            setShowTooltip(false);
        }
    };

    return (
        <div
            role="textbox"
            tabIndex={0}
            style={style}
            className="card-entry"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
        >
            <div
                ref={fieldRef}
                className="w-100 d-flex justify-content-between"
            >
                <p>
                    <b>{fieldKey}</b>
                </p>
                <p
                    ref={fieldValueRef}
                    role="presentation"
                    onMouseEnter={() => showCopiable(true)}
                    onMouseLeave={() => showCopiable(false)}
                    onKeyDown={event => {
                        if (event.key === ' ') {
                            copyFieldValue();
                        }
                    }}
                    onClick={copyFieldValue}
                    className="text-right"
                >
                    {value}
                </p>
            </div>

            {showTooltip ? (
                <OverlayTrigger
                    key={`overlay-${fieldKey}`}
                    placement="bottom-end"
                    overlay={CardTooltip({
                        fieldKey,
                        title,
                        setShowTooltip,
                    })}
                    show={showTooltip}
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
    setShowTooltip: (show: boolean) => void;
};

const CardTooltip = ({ fieldKey, title, setShowTooltip }: CardTooltip) => {
    const {
        commands,
        description,
        title: titleFromDocumentation,
    } = getDashboardFieldDocumentation(title, fieldKey);

    const tooltipTitle = titleFromDocumentation ?? fieldKey;

    return (
        <Tooltip id={`tooltip-${fieldKey}`}>
            <div
                className="card-tooltip"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <p className="font-weight-bold">{tooltipTitle}</p>
                <Documentation description={description} />
                <Commands commands={commands} />
            </div>
        </Tooltip>
    );
};

const Documentation = ({
    description,
}: {
    description: string | undefined;
}) => {
    if (!description) {
        return null;
    }

    return (
        <p style={{ color: colors.gray100 }}>
            {description.split('\n').map((partial, indexKey) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={indexKey}>
                    {partial}
                    <br />
                </span>
            ))}
        </p>
    );
};

const Commands = ({
    commands,
}: {
    commands: readonly (keyof typeof recommendedAT)[];
}) => {
    const dispatch = useDispatch();
    const isTracing = useSelector(getIsTracing);
    const detectedAtHostLibrary = useSelector(getDetectedAtHostLibrary);

    if (!isTracing || !detectedAtHostLibrary || commands.length === 0) {
        return null;
    }

    return (
        <>
            <p className="font-weight-bold">
                RELATED {commands.length > 1 ? 'COMMANDS' : 'COMMAND'}
            </p>
            {commands.map((cmd, index) => (
                <div key={`${cmd}`} className="mb-3">
                    <p className="mb-0">{cmd}</p>

                    <div className="d-flex">
                        {commandHasRecommeneded(cmd) ? (
                            <IconAction
                                action={() => {
                                    const commandsToSend = recommendedAT[cmd];
                                    if (commandsToSend) {
                                        dispatch(sendAT(commandsToSend));
                                    }
                                }}
                                label="Run command"
                                icon={mdiPlayBox}
                                index={index}
                            />
                        ) : null}
                        <IconAction
                            action={() => openUrl(documentationMap[cmd])}
                            label="Doc"
                            icon={mdiTextBox}
                            index={index}
                        />
                    </div>
                </div>
            ))}
        </>
    );
};

const IconAction = ({
    action,
    label,
    icon,
    index,
    className,
}: {
    action: () => void;
    label: string;
    icon: string;
    index?: number;
    className?: string;
}) => (
    <span
        role="button"
        tabIndex={index ?? 0}
        style={{
            fontSize: '14px',
            color: colors.nordicBlue,
            display: 'flex',
            alignItems: 'center',
        }}
        onClick={action}
        onKeyDown={event => {
            if (event.key === 'Enter') {
                action();
            }
        }}
        className={className}
    >
        <Icon className="mr-1" path={icon} size={0.6} />
        {label}
    </span>
);

const getDashboardFieldDocumentation = (
    cardTitle: string,
    fieldKey: string
) => {
    const cardType = cardTitle.includes('PDN')
        ? 'Packet Domain Network'
        : cardTitle;

    const tooltipDocumentation = documentation[cardType]?.[fieldKey];
    return (
        tooltipDocumentation ?? {
            commands: [],
            description: undefined,
        }
    );
};
