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

import { SerialPort } from '@nordicsemiconductor/nrf-device-lib-js';
import { Device, logger } from 'pc-nrfconnect-shared';

import { stopTrace } from '../features/tracing/nrfml';
import {
    getTaskId,
    setAvailableSerialPorts,
    setSerialPort,
} from '../features/tracing/traceSlice';
import { TAction } from '../thunk';
import { getSerialPort as getPersistedSerialPort } from '../utils/store';

export const closeDevice = (): TAction => (dispatch, getState) => {
    logger.info('Closing device');
    dispatch(setAvailableSerialPorts([]));
    dispatch(setSerialPort(null));
    const taskId = getTaskId(getState());
    dispatch(stopTrace(taskId));
};

export const openDevice =
    (device: Device): TAction =>
    dispatch => {
        // Reset serial port settings
        dispatch(setAvailableSerialPorts([]));
        dispatch(setSerialPort(null));
        const ports = device.serialPorts;
        if (ports?.length > 0) {
            dispatch(
                setAvailableSerialPorts(ports.map(port => port.comName ?? ''))
            );
        }
        const persistedPath = getPersistedSerialPort(device.serialNumber);
        if (persistedPath) {
            dispatch(setSerialPort(persistedPath));
            return;
        }
        const port = autoSelectPort(ports);
        const path = port?.comName ?? device?.serialport?.comName;
        if (path) {
            dispatch(setSerialPort(path));
        } else {
            logger.error("Couldn't identify serial port");
        }
    };

/**
 * Pick the serialport that should belong to the modem on PCA10090.
 * nrf-device-lib-js should ensure that the order of serialport objects is
 * deterministic and that the last port in the array is the one used for modem trace.
 * @param {Array<device>} ports array of nrf-device-lib-js serialport objects
 * @returns {SerialPort} the selected serialport object
 */
const autoSelectPort = (ports: SerialPort[]) => ports?.at(-1);
