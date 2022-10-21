import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../appReducer';
import { Packet } from '../../features/at/index';

interface Events {
    packets: Packet[];
}

const initialState: Events = {
    packets: [],
};

const eventsSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        addEvent: (state, actions: PayloadAction<Packet>) => {
            state.packets.push(actions.payload);
        },
    },
});

export const getEventPackets = (state: RootState) => state.app.events.packets;

export const { addEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
