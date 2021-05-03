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

import React, { useState } from 'react';
import { Button, FormControl } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { CollapsibleGroup, logger } from 'pc-nrfconnect-shared';

import { setDbFilePath } from '../actions';
import { getDbFilePath } from '../reducer';
import { loadGzFile } from '../utils/fileUtils';

export default () => {
    const dispatch = useDispatch();
    const dbFilePath = useSelector(getDbFilePath);
    const [modifiedPath, setModifiedPath] = useState(dbFilePath);

    const updateDbFilePath = async () => {
        const dbPath = await loadGzFile();
        if (!dbPath) {
            logger.error(
                'Invalid database file, please select a valid database file'
            );
            return;
        }
        setModifiedPath(dbPath);
    };

    const setNewPath = () => {
        dispatch(setDbFilePath(modifiedPath));
        logger.info(`Database path successfully updated to ${modifiedPath}`);
    };

    return (
        <CollapsibleGroup heading="Advanced Options" defaultCollapsed>
            <label htmlFor="database-file-input">Select database file</label>
            <FormControl
                placeholder="Database path"
                value={modifiedPath}
                id="database-file-input"
                title={dbFilePath}
                onChange={e => setModifiedPath(e.target.value)}
            />
            <div className="db-btn-group">
                <Button
                    variant="primary"
                    onClick={setNewPath}
                    disabled={modifiedPath === dbFilePath}
                >
                    Update
                </Button>
                <Button variant="secondary" onClick={updateDbFilePath}>
                    Browse
                </Button>
            </div>
        </CollapsibleGroup>
    );
};