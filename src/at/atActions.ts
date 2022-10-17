import { TAction } from '../thunk';
import { Packet, convert } from './';
import { setAT } from './atSlice';

export const convertWrapper =
    (packet: Packet): TAction =>
    (dispatch, getState): void => {
        const state = getState().app.at;
        dispatch(setAT(convert(packet, state)));
    };
