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
import { Card } from 'pc-nrfconnect-shared';

import Wireshark from './Wireshark';

export default () => (
    <Card title="Converting a trace">
        <section>
            <p>
                You can click on <b>Convert Raw Trace to PCAP</b>, located in
                the side panel, select a raw trace file (e.g. created by this
                app or the <em>Trace Collector</em>) and convert it into a{' '}
                <b>PCAP</b>
                file, which can then be opened e.g. in <em>Wireshark</em>.
            </p>
        </section>

        <section>
            <h5>Open PCAP in Wireshark</h5>
            <p>
                Open your <b>PCAP</b> traces in <em>Wireshark</em> to analyze
                them.
            </p>
            <Wireshark />
        </section>

        <section>
            <h5>RAW vs PCAP</h5>
            <p>
                <b>RAW</b> files capture all traffic to and from the modem and
                are larger than <b>PCAP</b> files. Some of the traffic is
                proprietary to
                <em>Nordic Semiconductor</em> and not publicly available.{' '}
                <b>RAW</b> files are primarily used as an attachment if you need
                assistance from
                <em>Nordic Semiconductor</em> support.
            </p>
            <p>
                <b>PCAP</b> files are used to open and inspect traffic details
                in
                <em>Wireshark</em>. <b>PCAP</b> files contain a subset of the
                details of a <b>RAW</b>
                file.
            </p>
        </section>
    </Card>
);
