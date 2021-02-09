import { Action } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { RootState } from './reducer';

export type TAction = ThunkAction<void, RootState, null, Action<unknown>>;
export type TDispatch = ThunkDispatch<RootState, null, Action<unknown>>;
