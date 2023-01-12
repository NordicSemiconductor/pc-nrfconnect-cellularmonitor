/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useState } from 'react';
import { Button, Card, openUrl } from 'pc-nrfconnect-shared';

import FlashSampleModal from './FlashSampleModal';

const NCD_EMAIL_ADDRESS = 'ncd-noreply@nordicsemi.no';
const USER_GUIDE_VIDEO = 'https://www.youtube.com/watch?v=8kB5XA5a2pI';

export default () => {
    const [modalVisible, setModalVisible] = useState(false);
    const close = useCallback(() => setModalVisible(false), []);

    return (
        <Card title="Feedback & User Guide">
            <section>
                <p>
                    This app is currently in an early stage of development, and
                    we are very interested in receiving feedback on it to help
                    us make the app as useful as possible. So if you have any
                    changes you want made, please send us an email to{' '}
                    <b>ncd-noreply@nordicsemi.no</b> by clicking the button
                    below.
                </p>
                <Button
                    className="secondary-btn w-100 mt-2"
                    onClick={() => openUrl(`mailto:${NCD_EMAIL_ADDRESS}`)}
                    title={`mailto:${NCD_EMAIL_ADDRESS}`}
                >
                    Give feedback
                </Button>
            </section>
            <section>
                <h5>User guide</h5>
                <p>
                    Click{' '}
                    <Button
                        className="p-0 btn-link border-0"
                        title={USER_GUIDE_VIDEO}
                        onClick={() => openUrl(USER_GUIDE_VIDEO)}
                    >
                        here
                    </Button>{' '}
                    for a short introductory video showing how to use the{' '}
                    <b>Trace Collector v2</b> for recording modem traces and how
                    to generate files for Wireshark.
                </p>
                <h5>Sample application</h5>
                <p>Try the trace collector sample app too see some data</p>

                <Button
                    className="w-100"
                    onClick={() => setModalVisible(!modalVisible)}
                >
                    Flash sample app to device
                </Button>
                <FlashSampleModal visible={modalVisible} close={close} />
            </section>
        </Card>
    );
};
