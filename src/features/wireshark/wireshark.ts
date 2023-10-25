/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { exec, execSync } from 'child_process';
import { accessSync, constants } from 'fs';
import { join, sep } from 'path';

import { getWiresharkPath } from '../../utils/store';
import { TAction } from '../../utils/thunk';

export const WIRESHARK_DOWNLOAD_URL = 'https://www.wireshark.org/#download';

const DEFAULT_WINDOWS_WIRESHARK_FOLDER = join(
    'C:',
    'Program Files',
    'Wireshark'
);
const DEFAULT_WINDOWS_PATH = join(
    DEFAULT_WINDOWS_WIRESHARK_FOLDER,
    'Wireshark.exe'
);

const DEFAULT_MAC_WIRESHARK_FOLDER = join(sep, 'Applications', 'Wireshark.app');

const macOSExecutableWithinAppFolder = () =>
    join('Contents', 'MacOS', 'wireshark');

export const findWireshark = (selectedPath: string | null) =>
    validatedSharkPath(selectedPath) || defaultSharkPath();

const validatedSharkPath = (path: string | null) => {
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
        : join(path, macOSExecutableWithinAppFolder());
};

export const defaultSharkPath = () => {
    if (process.platform === 'win32') {
        return validatedSharkPath(DEFAULT_WINDOWS_PATH);
    }
    if (process.platform === 'darwin') {
        return validatedSharkPath(DEFAULT_MAC_WIRESHARK_FOLDER);
    }
    if (process.platform === 'linux') {
        return locateSharkPathOnLinux();
    }

    logger.error(
        `Unable to locate Wireshark because your operating system '${process.platform}' is not supported.`
    );
    return null;
};

const locateSharkPathOnLinux = () => {
    try {
        return execSync(`which wireshark`).toString().trim();
    } catch (err) {
        logger.debug(`Could not locate Wireshark executable`);
        return null;
    }
};

export const openInWireshark =
    (pcapPath: string): TAction =>
    () => {
        const path = getWiresharkPath();
        const wiresharkPath = findWireshark(path);

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

let wiresharkDetected: boolean | undefined;
export const isWiresharkInstalled = () => {
    if (wiresharkDetected !== undefined) return wiresharkDetected;
    const path = getWiresharkPath();
    wiresharkDetected = findWireshark(path) !== null;
    return wiresharkDetected;
};
