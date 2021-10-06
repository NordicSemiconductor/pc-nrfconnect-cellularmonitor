/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Card } from 'pc-nrfconnect-shared';

import Wireshark from './Wireshark';

export default () => (
    <Card title="Converting a trace">
        <section>
            You can click on <b>Convert Raw Trace to PCAP</b>, located in the
            side panel, select a raw trace file (e.g. created by this app or the
            original <em>Trace Collector</em>) and convert it into a PCAP file,
            which can then be opened e.g. in <em>Wireshark</em>.
        </section>

        <section>
            <h5>RAW vs PCAP</h5>
            <p>
                RAW files capture all traffic to and from the modem and are
                larger than PCAP files. Some of the traffic is proprietary to
                Nordic Semiconductor and not publicly available. RAW files are
                primarily used as an attachment if you need assistance from
                Nordic Semiconductor support.
            </p>
            <p>
                PCAP files are used to open and inspect traffic details in{' '}
                <em>Wireshark</em>. PCAP files contain a subset of the details
                of a RAW file, such as IP traffic and AT commands.
            </p>
        </section>
        <section>
            <Wireshark />
        </section>
    </Card>
);
