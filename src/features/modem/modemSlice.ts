import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NrfConnectState } from 'pc-nrfconnect-shared';

import { Modem } from './modem';

export interface ModemState {
    readonly modem: Modem | null;
}

const initialState: ModemState = {
    modem: null,
};

const modemSlice = createSlice({
    name: 'modem',
    initialState,
    reducers: {
        setModem: (state, action: PayloadAction<Modem>) => {
            state.modem = action.payload;
        },
    },
});

type State = {
    modem: ModemState;
};

export type RootState = NrfConnectState<State>;

export const getModem = (state: RootState) => state.app.modem.modem;

export const { setModem } = modemSlice.actions;
export default modemSlice.reducer;
