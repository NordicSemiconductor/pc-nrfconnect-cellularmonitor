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

/* eslint-disable jsx-a11y/label-has-associated-control */

import React from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { logger } from 'pc-nrfconnect-shared';

import helpIcon from '../../resources/help-circle-outline.svg';
import { resetDbFilePath, setDbFilePath } from '../actions';
import { getDbFilePath } from '../reducer';
import { askForGzFile } from '../utils/fileUtils';
import { isDefaultDbFilePath } from '../utils/store';
import FilePathLink from './FilePathLink';

export default () => {
    const dispatch = useDispatch();
    const dbFilePath = useSelector(getDbFilePath);

    const updateDbFilePath = () => {
        const dbPath = askForGzFile();
        if (dbPath) {
            dispatch(setDbFilePath(dbPath));
            logger.info(`Database path successfully updated to ${dbPath}`);
        }
    };

    const restoreDefault = () => {
        dispatch(resetDbFilePath());
        logger.info(`Database path successfully reset to default value`);
    };

    return (
        <>
            <div className="db-help-section">
                <label htmlFor="database-file-input">
                    Select database file
                </label>
                <img
                    src={helpIcon}
                    alt="Question mark"
                    title="A database file is used to decode trace data"
                />
            </div>
            <FilePathLink filePath={dbFilePath} />
            <div className="db-btn-group">
                <Button variant="secondary" onClick={updateDbFilePath}>
                    Browse
                </Button>
                {isDefaultDbFilePath(dbFilePath) || (
                    <Button
                        variant="secondary"
                        className=" w-100"
                        onClick={restoreDefault}
                    >
                        Reset
                    </Button>
                )}
            </div>
        </>
    );
};
