/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Group, openUrl } from 'pc-nrfconnect-shared';

import { getSerialPort } from '../../features/tracing/traceSlice';

import './sidepanel.scss';

const urls = {
    infoOnDk:
        'https://www.nordicsemi.com/Products/Development-hardware/nrf9160-dk',
    infoOnThingy:
        'https://www.nordicsemi.com/Products/Development-hardware/Nordic-Thingy-91',
    buyDk: 'https://www.nordicsemi.com/About-us/BuyOnline?search_token=nrf9160-DK&series_token=nRF9160',
    buyThingy:
        'https://www.nordicsemi.com/About-us/BuyOnline?search_token=nRF6943&series_token=nRF9160',
};

const Link: FC<{ onClick: () => void; url: string }> = ({
    children,
    onClick,
    url,
}) => (
    <a
        role="link"
        tabIndex={0}
        onClick={onClick}
        title={url}
        onKeyDown={e => {
            if (e.key === 'Enter') {
                onClick();
            }
        }}
    >
        {children}
    </a>
);

export default () => {
    const isDeviceSelected = useSelector(getSerialPort);

    if (isDeviceSelected) {
        return null;
    }

    return (
        <Group heading="Instructions">
            <p>
                nRF9160 hardware is required to use this application. We
                recommend our{' '}
                <Link
                    onClick={() => openUrl(urls.infoOnDk)}
                    url={urls.infoOnDk}
                >
                    nRF9160 development kit
                </Link>{' '}
                or{' '}
                <Link
                    onClick={() => openUrl(urls.infoOnThingy)}
                    url={urls.infoOnThingy}
                >
                    Thingy:91
                </Link>
                :
            </p>
            <ul>
                <li>
                    <Link onClick={() => openUrl(urls.buyDk)} url={urls.buyDk}>
                        Buy nRF9160 DK
                    </Link>
                </li>
                <li>
                    <Link
                        onClick={() => openUrl(urls.buyThingy)}
                        url={urls.buyThingy}
                    >
                        Buy Thingy:91
                    </Link>
                </li>
            </ul>
            <hr />
        </Group>
    );
};
