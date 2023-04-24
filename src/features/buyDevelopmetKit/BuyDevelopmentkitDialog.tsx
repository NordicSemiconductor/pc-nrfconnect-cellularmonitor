/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useState } from 'react';
import { Button, InfoDialog, openUrl } from 'pc-nrfconnect-shared';

export default () => {
    const [modalVisible, setModalVisible] = useState(false);

    const close = useCallback(() => {
        setModalVisible(false);
    }, []);

    const kits = [
        {
            name: 'nRF9160Dk',
            url: 'https://www.nordicsemi.com/About-us/BuyOnline?search_token=nrf9160-DK&series_token=nRF9160',
        },
        {
            name: 'Thingy:91',
            url: 'https://www.nordicsemi.com/About-us/BuyOnline?search_token=nRF6943&series_token=nRF9160',
        },
    ];

    return (
        <>
            <Button
                className="w-100"
                variant="secondary"
                onClick={() => setModalVisible(!modalVisible)}
            >
                Buy development kit...
            </Button>

            <InfoDialog
                isVisible={modalVisible}
                onHide={close}
                title="Buy development kit"
            >
                <p>
                    Choose a development kit to see global vendor availability.
                </p>
                {kits.map(kit => (
                    <div key={kit.name}>
                        <Button
                            variant="link"
                            onClick={() => {
                                openUrl(kit.url);
                            }}
                        >
                            {kit.name}
                        </Button>
                    </div>
                ))}
            </InfoDialog>
        </>
    );
};