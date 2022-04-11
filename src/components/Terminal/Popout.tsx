/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import {Button} from 'pc-nrfconnect-shared';

export const PopoutPlaceholder = ({
    popoutId,
    commandCallback,
    onModemData,
    closePopout,
}: {
    popoutId: number;
    commandCallback: (command: string) => string | undefined;
    onModemData: (listener: (line: string) => void) => () => void;
    closePopout: () => void;
}) => {
    const onUserWrite = useCallback(
        (_, data) => {
            const ret = commandCallback(data);
            if (ret) ipcRenderer.sendTo(popoutId, 'terminal-data', ret);
        },
        [popoutId, commandCallback]
    );

    useEffect(() => {
        // Make sure to remove the correct version of callback from listener
        const onUserWriteTemp = onUserWrite;
        ipcRenderer.on('terminal-data', onUserWriteTemp);

        return () => {
            ipcRenderer.removeListener('terminal-data', onUserWriteTemp);
        };
    }, [onUserWrite]);

    useEffect(() => {
        const unregisterOnModemData = onModemData(line =>
            ipcRenderer.sendTo(popoutId, 'terminal-data', line)
        );

        return () => {
            unregisterOnModemData();
        };
    }, [popoutId, onModemData]);

    return (
        <div className="collapse-popout">
            <p>Terminal is active in a separate window.</p>
            <Button type="button" onClick={closePopout}>
                Close separate terminal window
                <span className="mdi mdi-arrow-collapse" />
            </button>
        </div>
    );
};

export default PopoutPlaceholder;
