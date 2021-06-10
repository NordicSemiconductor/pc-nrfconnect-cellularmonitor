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

import { Device, logger, Serialport } from 'pc-nrfconnect-shared';

import { TAction } from '../thunk';
import { setAvailableSerialPorts, setSerialPort } from '.';

const getSerialPorts = (device: Device) =>
    Object.entries(device)
        .filter(([key]) => key.startsWith('serialport'))
        .map(([, value]: [string, Serialport]) => value);

export const closeDevice = (): TAction => dispatch => {
    logger.info('Closing device');
    dispatch(setAvailableSerialPorts([]));
    dispatch(setSerialPort(null));
};

export const openDevice = (device: Device): TAction => dispatch => {
    // Reset serial port settings
    dispatch(setAvailableSerialPorts([]));
    dispatch(setSerialPort(null));
    const ports = getSerialPorts(device);
    if (ports.length > 0) {
        dispatch(setAvailableSerialPorts(ports.map(port => port.path)));
    }
    const port = pickSerialPort(ports);
    const path = port ? port.path : device?.serialport?.path;
    if (path) {
        dispatch(setSerialPort(path));
    } else {
        logger.error("Couldn't identify serial port");
    }
};

// Prefer to use the serialport 8 property or fall back to the serialport 7 property
const portPath = (serialPort: Serialport) =>
    serialPort.path || serialPort.comName;

/**
 * Pick the serialport that should belong to the modem on PCA10090
 * @param {Array<device>} serialports array of device-lister serialport objects
 * @returns {object} the selected serialport object
 */
const pickSerialPort = (serialports: Serialport[]) => {
    if (serialports.length === 1) {
        return serialports[0];
    }
    switch (process.platform.slice(0, 3)) {
        case 'win':
            return serialports.find(s => {
                if (s.pnpId) {
                    return /MI_0[34]/.test(s.pnpId);
                }
                return false;
            });
        case 'lin':
            return serialports.find(s => {
                if (s.pnpId) {
                    /-if0[34]$/.test(s.pnpId);
                }
                return false;
            });
        case 'dar':
            return serialports.find(s => /5$/.test(portPath(s)));
        default:
    }
    return undefined;
};
