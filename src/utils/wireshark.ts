/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { exec, execSync } from 'child_process';
import { accessSync, constants } from 'fs';
import { join, sep } from 'path';
import { logger } from 'pc-nrfconnect-shared';

export const DEFAULT_WINDOWS_WIRESHARK_PATH = join(
    'C:',
    'Program Files',
    'Wireshark',
    'Wireshark.exe'
);
const DEFAULT_MACOS_WIRESHARK_PATH = join(sep, 'Applications', 'Wireshark.app');
const MACOS_WIRESHARK_EXECUTABLE_IN_APP = join(
    'Contents',
    'MacOS',
    'Wireshark'
);

export const findWireshark = (selectedPath: string | null) =>
    validatedWiresharkPath(selectedPath) || defaultWiresharkPath();

const validatedWiresharkPath = (path: string | null) => {
    if (path == null) {
        return null;
    }

    try {
        accessSync(path, constants.X_OK);
    } catch (err) {
        logger.debug(`Could not locate wireshark executable in ${path}`);
        return null;
    }

    return process.platform !== 'darwin'
        ? path
        : join(path, MACOS_WIRESHARK_EXECUTABLE_IN_APP);
};

export const defaultWiresharkPath = () => {
    if (process.platform === 'win32') {
        return validatedWiresharkPath(DEFAULT_WINDOWS_WIRESHARK_PATH);
    }
    if (process.platform === 'darwin') {
        return validatedWiresharkPath(DEFAULT_MACOS_WIRESHARK_PATH);
    }
    if (process.platform === 'linux') {
        return locateWiresharkPathOnLinux();
    }

    logger.error(
        `Unable to locate Wireshark because your operating system '${process.platform}' is not supported.`
    );
    return null;
};

const locateWiresharkPathOnLinux = () => {
    try {
        return execSync('which wireshark').toString().trim();
    } catch (err) {
        logger.debug('Could not locate Wireshark executable');
        return null;
    }
};

export const openInWireshark = (
    pcapPath: string,
    wiresharkPath: string | null
) => {
    if (wiresharkPath == null) {
        logger.error('No Wireshark executable found');
        return;
    }

    return exec(`"${wiresharkPath}" -r "${pcapPath}"`, err => {
        if (err) {
            logger.error(err);
        }
    });
};
