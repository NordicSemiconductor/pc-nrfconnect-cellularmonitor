/* Copyright (c) 2015 - 2018, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
    buyDk:
        'https://www.nordicsemi.com/About-us/BuyOnline?search_token=nrf9160-DK&series_token=nRF9160',
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
    const selectedSerialPort = useSelector(getSerialPort);

    if (selectedSerialPort) {
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
