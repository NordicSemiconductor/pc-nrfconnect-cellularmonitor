/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { State } from '../../types';
import { atPacket, convertPackets } from '../testUtils';

const stateWithApns = {
    uiccInitialised: true,
    accessPointNames: {
        test: {
            cid: 0,
        },
        test2: {
            cid: 1,
        },
    },
} as Partial<State>;

test('+CGEV: Detach removes all APNs', () => {
    let state = convertPackets(
        [atPacket('+CGEV: NW DETACH')],
        stateWithApns as State
    );
    expect(state.accessPointNames).toEqual({});

    state = convertPackets(
        [atPacket('+CGEV: ME DETACH')],
        stateWithApns as State
    );
    expect(state.accessPointNames).toEqual({});
});

test('+CGEV: Activated Default Bearer updates APNs', () => {
    let state = convertPackets([atPacket('+CGEV: ME PDN ACT 0')]);
    expect(state.accessPointNames).toEqual({
        0: {
            cid: 0,
        },
    });

    state = convertPackets([atPacket('+CGEV: ME PDN ACT 0,0')]);
    expect(state.accessPointNames).toEqual({
        0: {
            cid: 0,
            info: 'IPv4 Only',
        },
    });

    state = convertPackets([atPacket('+CGEV: ME PDN ACT 0,1')]);
    expect(state.accessPointNames).toEqual({
        0: {
            cid: 0,
            info: 'IPv6 Only',
        },
    });

    state = convertPackets([atPacket('+CGEV: ME PDN ACT 0,2')]);
    expect(state.accessPointNames).toEqual({
        0: {
            cid: 0,
            info: 'Only single access bearers allowed',
        },
    });

    state = convertPackets([atPacket('+CGEV: ME PDN ACT 0,3')]);
    expect(state.accessPointNames).toEqual({
        0: {
            cid: 0,
            info: 'Only single access bearers allowed and context activation for a second address type bearer was not successful.',
        },
    });
});

test('+CGEV: PDN deactivation removes the relevant AccessPointName', () => {
    let state = convertPackets(
        [atPacket('+CGEV: ME PDN DEACT 0')],
        stateWithApns as State
    );
    expect(state.accessPointNames).toEqual({
        test2: {
            cid: 1,
        },
    });

    state = convertPackets([atPacket('+CGEV: ME PDN DEACT 1')], state);
    expect(state.accessPointNames).toEqual({});
});
