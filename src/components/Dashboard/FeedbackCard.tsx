/* Copyright (c) 2015 - 2021, Nordic Semiconductor ASA
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
import { Card, openUrl } from 'pc-nrfconnect-shared';

const NCD_EMAIL_ADDRESS = 'ncd-noreply@nordicsemi.no';
const USER_GUIDE_VIDEO = 'https://www.youtube.com/watch?v=8kB5XA5a2pI';

export default () => (
    <Card title="Feedback & User Guide">
        <section>
            <p>
                This app is currently in an early stage of development, and we
                are very interested in receiving feedback on it to help us make
                the app as useful as possible. So if you have any changes you
                want made, please send us an email to{' '}
                <b>ncd-noreply@nordicsemi.no</b> by clicking the button below.
            </p>
            <Button
                className="secondary-btn w-100 mt-2"
                variant="secondary"
                onClick={() => openUrl(`mailto:${NCD_EMAIL_ADDRESS}`)}
                title={`mailto:${NCD_EMAIL_ADDRESS}`}
            >
                Give feedback
            </Button>
        </section>
        <section>
            <h5>User guide</h5>
            Click{' '}
            <Button
                variant="link"
                className="card-links"
                title={USER_GUIDE_VIDEO}
                onClick={() => openUrl(USER_GUIDE_VIDEO)}
            >
                here
            </Button>{' '}
            for a short introductory video showing how to use the{' '}
            <b>Trace Collector v2</b> for recording modem traces and how to
            generate files for Wireshark.
        </section>
    </Card>
);
