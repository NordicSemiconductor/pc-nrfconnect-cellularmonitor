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

import { PcapInitParameters, RawFileInitParameters } from 'nrf-monitor-lib-js';

export const TRACE_FORMATS = ['raw', 'pcap'] as const;
export type TraceFormat = typeof TRACE_FORMATS[number];

export const pcapSinkConfig = (filepath: string): PcapInitParameters => {
    return {
        name: 'nrfml-pcap-sink',
        init_parameters: {
            file_path: `${filepath}.pcap`,
        },
    };
};

const rawFileSinkConfig = (filepath: string): RawFileInitParameters => {
    return {
        // @ts-ignore -- error in generated types in monitor-lib. This is addressed in https://github.com/NordicPlayground/nrf-monitor-lib/pull/76 and can be removed here when that fix is merged and released
        name: 'nrfml-raw-file-sink',
        init_parameters: {
            file_path: `${filepath}.bin`,
        },
    };
};

export const getSinkConfig = (format: TraceFormat, filepath: string) =>
    format === 'pcap' ? pcapSinkConfig(filepath) : rawFileSinkConfig(filepath);
