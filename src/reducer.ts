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

import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { NrfConnectState } from 'pc-nrfconnect-shared';

import {
    resetDbFilePath,
    setAvailableSerialPorts,
    setDbFilePath,
    setModem,
    setNrfmlTaskId,
    setSerialPort,
    setTracePath,
    setTraceSize,
    setWiresharkPath,
} from './actions';
import { Modem } from './modem/modem';
import { TaskId } from './nrfml/nrfml';
import {
    deleteDbFilePath as deletePersistedDbFilePath,
    getDbFilePath as getPersistedDbFilePath,
    getWiresharkPath as getPersistedWiresharkPath,
    setDbFilePath as setPersistedDbFilePath,
    setWiresharkPath as setPersistedWiresharkPath,
} from './utils/store';

export interface State {
    readonly modem: Modem | null;
    serialPort: string | null;
    tracePath: string;
    traceSize: number;
    nrfmlTaskId: TaskId | null;
    availableSerialPorts: string[];
    dbFilePath: string;
    wiresharkPath: string | null;
}

const initialState = (): State => ({
    modem: null,
    tracePath: '',
    traceSize: 0,
    nrfmlTaskId: null,
    serialPort: null,
    availableSerialPorts: [],
    dbFilePath: getPersistedDbFilePath(),
    wiresharkPath: getPersistedWiresharkPath(),
});

export default createReducer(initialState(), {
    [setModem.type]: (state, action: PayloadAction<Modem>) => {
        state.modem = action.payload;
    },
    [setNrfmlTaskId.type]: (state, action: PayloadAction<TaskId>) => {
        state.nrfmlTaskId = action.payload;
    },
    [setTracePath.type]: (state, action: PayloadAction<string>) => {
        state.tracePath = action.payload;
    },
    [setTraceSize.type]: (state, action: PayloadAction<number>) => {
        state.traceSize = action.payload;
    },
    [setAvailableSerialPorts.type]: (
        state,
        action: PayloadAction<string[]>
    ) => {
        state.availableSerialPorts = action.payload;
    },
    [setSerialPort.type]: (state, action: PayloadAction<string>) => {
        state.serialPort = action.payload;
    },
    [setDbFilePath.type]: (state, action: PayloadAction<string>) => {
        state.dbFilePath = action.payload;
        setPersistedDbFilePath(action.payload);
    },
    [resetDbFilePath.type]: state => {
        deletePersistedDbFilePath();
        state.dbFilePath = getPersistedDbFilePath();
    },
    [setWiresharkPath.type]: (state, action: PayloadAction<string>) => {
        state.wiresharkPath = action.payload;
        setPersistedWiresharkPath(action.payload);
    },
});

export type RootState = NrfConnectState<State>;

export const getModem = (state: RootState) => state.app.modem;
export const getNrfmlTaskId = (state: RootState) => state.app.nrfmlTaskId;
export const getSerialPort = (state: RootState) => state.app.serialPort;
export const getAvailableSerialPorts = (state: RootState) =>
    state.app.availableSerialPorts;
export const getTracePath = (state: RootState) => state.app.tracePath;
export const getTraceSize = (state: RootState) => state.app.traceSize;
export const getDbFilePath = (state: RootState) => state.app.dbFilePath;
export const getWiresharkPath = (state: RootState) => state.app.wiresharkPath;
