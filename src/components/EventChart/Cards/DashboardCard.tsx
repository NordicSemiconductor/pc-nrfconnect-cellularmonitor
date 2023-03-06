/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useRef, useState } from 'react';
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
    description?: string[];
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
}: DashboardCard) => {
    const target = useRef(null);

    return (
        <div ref={target}>
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
                            parent={target.current as HTMLElement | null}
                        />
                    </li>
                ))}
            </Card>
        </div>
    );
};

type CardEntry = {
    fieldKey: string;
    value: string | number;
    commands: readonly ATCommands[];
    parent: HTMLElement | null;
};

let toolTipTimeout: NodeJS.Timeout;

const CardEntry = ({ fieldKey, value, commands, parent }: CardEntry) => {
    const [keepShowing, setKeepShowing] = useState(false);
    const [toolTipLocation, setToolTipLocation] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const target = useRef(null);

    const showTooltip = (show: boolean) => setKeepShowing(show);
    const parentBoundingClientRect = parent?.getBoundingClientRect();

    const onMouseMove = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        if (keepShowing) return;
        setToolTipLocation({
            x: event.clientX,
            y: event.clientY,
        });
        clearTimeout(toolTipTimeout);
        toolTipTimeout = setTimeout(() => setKeepShowing(true), 500);
    };

    return (
        <div
            ref={target}
            className="card-entry"
            onMouseMove={event => onMouseMove(event)}
            onMouseLeave={() => {
                setKeepShowing(false);
                setToolTipLocation(null);
                clearTimeout(toolTipTimeout);
            }}
        >
            <p className="card-key">{fieldKey}</p>
            <p className="card-value">{value}</p>

            {toolTipLocation ? (
                <OverlayTrigger
                    key={`overlay-${fieldKey}`}
                    placement="bottom-start"
                    overlay={CardTooltip({ fieldKey, commands, showTooltip })}
                    show={keepShowing}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: `${
                                toolTipLocation.y -
                                (parentBoundingClientRect?.y ?? 0)
                            }px`,
                            left: `${
                                toolTipLocation.x -
                                (parentBoundingClientRect?.x ?? 0)
                            }px`,
                        }}
                    />
                </OverlayTrigger>
            ) : null}
        </div>
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
                    ? commands.map((cmd, index) => (
                          <li key={`${cmd}`}>
                              <span
                                  onClick={() => openUrl(documentationMap[cmd])}
                                  onKeyDown={e => {
                                      if (e.key === 'Enter')
                                          openUrl(documentationMap[cmd]);
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
        </div>
    </Tooltip>
);
