/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect } from 'react';
import { ipcRenderer } from 'electron';

export const PopoutPlaceholder = ({
    popoutId,
    commandCallback,
    onModemData,
}: {
    popoutId: number;
    commandCallback: (command: string) => string | undefined;
    onModemData: (listener: (line: string) => void) => void;
}) => {
    const onUserWrite = useCallback(
        (_, data) => {
            const ret = commandCallback(data);
            if (ret) ipcRenderer.sendTo(popoutId, 'terminal-data', ret);
        },
        [popoutId, commandCallback]
    );

    useEffect(() => {
        const onUserWriteTemp = onUserWrite;
        ipcRenderer.on('terminal-data', onUserWriteTemp);

        return () => {
            ipcRenderer.removeListener('terminal-data', onUserWriteTemp);
        };
    }, [onUserWrite]);

    useEffect(() => {
        onModemData(line =>
            ipcRenderer.sendTo(popoutId, 'terminal-data', line)
        );
    }, [popoutId, onModemData]);

    return <></>;
};

export default PopoutPlaceholder;
