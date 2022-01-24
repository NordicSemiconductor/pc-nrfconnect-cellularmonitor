/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { exec, execSync } from 'child_process';
import { accessSync, constants } from 'fs';
import { join, sep } from 'path';
import { logger } from 'pc-nrfconnect-shared';

type Shark = 'wireshark' | 'tshark';

const DEFAULT_WINDOWS_WIRESHARK_FOLDER = join(
    'C:',
    'Program Files',
    'Wireshark'
);
const DEFAULT_WINDOWS_PATHS = {
    wireshark: join(DEFAULT_WINDOWS_WIRESHARK_FOLDER, 'Wireshark.exe'),
    tshark: join(DEFAULT_WINDOWS_WIRESHARK_FOLDER, 'tshark.exe'),
};

const DEFAULT_MACOS_WIRESHARK_FOLDER = join(sep, 'Applications');
const DEFAULT_MAC_PATHS = {
    wireshark: join(DEFAULT_MACOS_WIRESHARK_FOLDER, 'Wireshark.app'),
    tshark: join(DEFAULT_MACOS_WIRESHARK_FOLDER, 'tshark.app'),
};

const MACOS_WIRESHARK_EXECUTABLE_IN_APP = join(
    'Contents',
    'MacOS',
    'Wireshark'
);
const MACOS_TSHARK_EXECUTABLE_IN_APP = join('Contents', 'MacOS', 'tshark');

export const findWireshark = (selectedPath: string | null) =>
    validatedSharkPath('wireshark', selectedPath) ||
    defaultSharkPath('wireshark');

export const findTshark = (selectedPath: string | null) =>
    validatedSharkPath('tshark', selectedPath) || defaultSharkPath('tshark');

const validatedSharkPath = (shark: Shark, path: string | null) => {
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
        : join(
              path,
              shark === 'wireshark'
                  ? MACOS_WIRESHARK_EXECUTABLE_IN_APP
                  : MACOS_TSHARK_EXECUTABLE_IN_APP
          );
};

export const defaultSharkPath = (shark: Shark) => {
    if (process.platform === 'win32') {
        return validatedSharkPath(shark, DEFAULT_WINDOWS_PATHS[shark]);
    }
    if (process.platform === 'darwin') {
        return validatedSharkPath(shark, DEFAULT_MAC_PATHS[shark]);
    }
    if (process.platform === 'linux') {
        return locateSharkPathOnLinux(shark);
    }

    logger.error(
        `Unable to locate Wireshark because your operating system '${process.platform}' is not supported.`
    );
    return null;
};

const locateSharkPathOnLinux = (shark: Shark) => {
    try {
        return execSync(`which ${shark}`).toString().trim();
    } catch (err) {
        logger.debug(
            `Could not locate ${
                shark === 'wireshark' ? 'Wireshark' : 'Tshark'
            } executable`
        );
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
