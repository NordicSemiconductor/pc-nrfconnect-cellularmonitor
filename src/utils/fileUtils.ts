/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { dialog, shell } from '@electron/remote';
import { FileFilter } from 'electron';
import path from 'path';
import { getAppDataDir } from 'pc-nrfconnect-shared';

import { autoDetectDbRootFolder } from './store';

export const askForTraceDbFile = () =>
    askForFile(
        [
            {
                name: 'Trace Databases',
                extensions: ['gz', 'json'],
            },
            { name: 'All Files', extensions: ['*'] },
        ],
        autoDetectDbRootFolder()
    );

export const askForTraceFile = () =>
    askForFile([
        { name: 'Trace', extensions: ['bin'] },
        { name: 'All Files', extensions: ['*'] },
    ]);

export const askForPcapFile = () =>
    askForFile([
        { name: 'PCAP', extensions: ['pcapng'] },
        { name: 'All Files', extensions: ['*'] },
    ]);

export const askForWiresharkPath = () => {
    if (process.platform === 'darwin') {
        return askForFile(
            [
                { name: 'Executable', extensions: ['app'] },
                { name: 'All Files', extensions: ['*'] },
            ],
            `/Applications`
        );
    }
    if (process.platform === 'win32') {
        return askForFile(
            [
                { name: 'Executable', extensions: ['exe'] },
                { name: 'All Files', extensions: ['*'] },
            ],
            `C:\\Program Files`
        );
    }
};

const askForFile = (filters: FileFilter[], defaultPath = getAppDataDir()) =>
    dialog.showOpenDialogSync({
        defaultPath,
        filters,
    })?.[0];

export const openInFolder = (filepath: string) =>
    shell.showItemInFolder(filepath);

type FileName = string;
type FileDirectory = string;
type FileTuple = [FileName, FileDirectory];

export const getNameAndDirectory = (
    filepath: string,
    ext?: string
): FileTuple => [path.basename(filepath, ext), path.dirname(filepath)];
