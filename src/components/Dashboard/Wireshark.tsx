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

import React, { FC } from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch, useSelector } from 'react-redux';
import { openUrl } from 'pc-nrfconnect-shared';

import {
    getWiresharkPath,
    setWiresharkPath,
} from '../../features/tracing/traceSlice';
import { askForPcapFile, askForWiresharkPath } from '../../utils/fileUtils';
import { findWireshark, openInWireshark } from '../../utils/wireshark';

const WIRESHARK_DOWNLOAD_URL = 'https://www.wireshark.org/#download';

const SelectWireshark: FC = ({ children }) => {
    const dispatch = useDispatch();

    const updateWiresharkPath = () => {
        const selectedWiresharkPath = askForWiresharkPath();
        if (selectedWiresharkPath != null) {
            dispatch(setWiresharkPath(selectedWiresharkPath));
        }
    };

    return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a href="#" onClick={updateWiresharkPath} role="button">
            {children}
        </a>
    );
};

export default () => {
    const selectedWiresharkPath = useSelector(getWiresharkPath);
    const wiresharkPath = findWireshark(selectedWiresharkPath);

    const loadPcap = () => {
        const filename = askForPcapFile();
        if (filename) {
            openInWireshark(filename, wiresharkPath);
        }
    };

    return (
        <div className="wireshark">
            {wiresharkPath != null ? (
                <>
                    <Button
                        className="w-100 secondary-btn"
                        variant="secondary"
                        onClick={loadPcap}
                    >
                        Open in Wireshark
                    </Button>
                    <div className="w-100 mt-2 text-center">
                        <SelectWireshark>
                            Or select a different Wireshark executable
                        </SelectWireshark>
                    </div>
                </>
            ) : (
                <>
                    <h6>Wireshark not found</h6>
                    <p>
                        You can{' '}
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a
                            href="#"
                            onClick={() => openUrl(WIRESHARK_DOWNLOAD_URL)}
                        >
                            download and install Wireshark
                        </a>{' '}
                        or{' '}
                        <SelectWireshark>select the executable</SelectWireshark>{' '}
                        if you already have it installed but in a location where
                        this app currently does not find it.
                    </p>
                </>
            )}
        </div>
    );
};
