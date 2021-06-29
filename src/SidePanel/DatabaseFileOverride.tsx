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
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { logger } from 'pc-nrfconnect-shared';

import helpIcon from '../../resources/help-circle-outline.svg';
import { resetManualDbFilePath, setManualDbFilePath } from '../actions';
import { getManualDbFilePath } from '../reducer';
import { askForTraceDbFile } from '../utils/fileUtils';
import FilePathLink from './FilePathLink';

export default () => {
    const dispatch = useDispatch();
    const manualDbFilePath = useSelector(getManualDbFilePath);

    const updateManualDbFilePath = () => {
        const manualDbPath = askForTraceDbFile();
        if (manualDbPath) {
            dispatch(setManualDbFilePath(manualDbPath));
            logger.info(
                `Database path successfully updated to ${manualDbPath}`
            );
        }
    };

    const restoreDefault = () => {
        dispatch(resetManualDbFilePath());
        logger.info(`Database path successfully reset to default value`);
    };

    const label = (
        <div className="db-help-section">
            <span>Override trace database</span>
            <img
                src={helpIcon}
                alt="Question mark"
                title="A trace database file is used to decode trace data"
            />
        </div>
    );

    if (manualDbFilePath == null) {
        return (
            <>
                <div className="db-help-section">
                    <div>Trace database</div>
                    <img
                        src={helpIcon}
                        alt="Explain trace database"
                        title="A trace database file is used to decode trace data"
                    />
                </div>
                <p>
                    A trace database matching the modem firmware of your device
                    is automatically chosen. You can also select one explicitly.
                </p>
                <Button
                    variant="secondary"
                    className="w-100"
                    onClick={updateManualDbFilePath}
                >
                    Select Trace DB
                </Button>
            </>
        );
    }

    return (
        <>
            <FilePathLink filePath={manualDbFilePath} label={label} />
            <Button
                variant="secondary"
                className="w-100"
                onClick={updateManualDbFilePath}
            >
                Select Trace DB
            </Button>
            <Button
                variant="secondary"
                className=" w-100"
                onClick={restoreDefault}
            >
                Autoselect Trace DB
            </Button>
        </>
    );
};
