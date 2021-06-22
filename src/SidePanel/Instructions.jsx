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

import React from 'react';
import Button from 'react-bootstrap/Button';
import { useSelector } from 'react-redux';
import { Group, openUrl } from 'pc-nrfconnect-shared';

import { getSerialPort } from '../reducer';

import './sidepanel.scss';

const urls = {
    gettingStarted9160:
        'https://www.nordicsemi.com/Software-and-tools/Development-Kits/nRF9160-DK/GetStarted',
    gettingStartedThingy91:
        'https://www.nordicsemi.com/Software-and-tools/Prototyping-platforms/Nordic-Thingy-91/GetStarted',
    buy9160:
        'https://www.nordicsemi.com/About-us/BuyOnline?search_token=nrf9160-DK&series_token=nRF9160',
    buyThingy91:
        'https://www.nordicsemi.com/About-us/BuyOnline?search_token=nRF6943&series_token=nRF9160',
};

export default () => {
    const selectedSerialPort = useSelector(getSerialPort);

    if (selectedSerialPort) {
        return null;
    }

    return (
        <Group heading="Instructions">
            <p>nRF9160 hardware is required to use this application.</p>
            <Button
                className="user-guide-link"
                variant="link"
                onClick={() => openUrl(urls.gettingStarted)}
            >
                Getting started with nRF9160
            </Button>
            <Button
                className="user-guide-link"
                variant="link"
                onClick={() => openUrl(urls.gettingStarted)}
            >
                Getting started with Thingy:91
            </Button>
            <Button
                className="mt-3 w-100 secondary-btn"
                variant="set"
                onClick={() => openUrl(urls.buy9160)}
            >
                Buy nRF9160
            </Button>
            <Button
                variant="set"
                className="mt-3 w-100 secondary-btn"
                onClick={() => openUrl(urls.buyThingy91)}
            >
                Buy Thingy:91
            </Button>
        </Group>
    );
};
