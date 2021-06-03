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

import { exec, execSync } from 'child_process';
import { accessSync, constants } from 'fs';
import { join, sep } from 'path';
import { logger } from 'pc-nrfconnect-shared';

const DEFAULT_WINDOWS_WIRESHARK_PATH = join(
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

const defaultWiresharkPath = () => {
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
        return execSync('which wireshark').toString();
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

    return exec(`'${wiresharkPath}' -r '${pcapPath}'`, err => {
        if (err) {
            logger.error(err);
        }
    });
};
