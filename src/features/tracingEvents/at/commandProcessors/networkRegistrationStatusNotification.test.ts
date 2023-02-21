/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import { State } from '../../types';
import { atPacket, convertPackets, OkPacket } from '../testUtils';

/*

READ CMD: AT+CEREG?
+CEREG: <n>,<stat>[,[<tac>],[<ci>],[<cT>][,<cause_type>],[<reject_cause>][,[<Active-Time>],[<Periodic-TAU>]]]]
    - <n>                   ==> Always
    - <stat>                ==> When n >= 1
    - [<tac>]               ==> When n >= 2
    - [<ci>]                ==> When n >= 2
    - [<AcT>]               ==> When n >= 2
    - [<cause_type>]        ==> When n = 3 or 5 FIXME: Unsure how its presented 
    - [<reject_cause>]      ==> When n = 3 or 5 FIXME: Unsure how its presented (this it's one of  2 | 3 | 6 | 9 | 10, according to 3GPP 24.301 Annex A.1)
    - [<Active-Time>]       ==> When n >= 4
    - [<Periodic-TAU>]      ==> When n >= 4

*/

const readCmd = atPacket('AT+CEREG?');

const setCommands = [
    // Unsubscribe
    {
        commands: [atPacket('AT+CEREG=0'), OkPacket],
        expected: {
            networkStatusNotifications: 0,
        } as Partial<State>,
    },
    {
        commands: [atPacket('AT+CEREG=1'), OkPacket],
        expected: {
            networkStatusNotifications: 1,
        } as Partial<State>,
    },
    {
        commands: [atPacket('AT+CEREG=2'), OkPacket],
        expected: {
            networkStatusNotifications: 2,
        } as Partial<State>,
    },
    {
        commands: [atPacket('AT+CEREG=3'), OkPacket],
        expected: {
            networkStatusNotifications: 3,
        } as Partial<State>,
    },
    {
        commands: [atPacket('AT+CEREG=4'), OkPacket],
        expected: {
            networkStatusNotifications: 4,
        } as Partial<State>,
    },
    {
        commands: [atPacket('AT+CEREG=5'), OkPacket],
        expected: {
            networkStatusNotifications: 5,
        } as Partial<State>,
    },
];

const testResponses = [
    {
        response: atPacket(`+CEREG: 1,1,\r\nOK\r\n`),
        expected: {
            networkStatus: 1,
        },
    },
    {
        response: atPacket(`+CEREG: 2,1,"002F","0012BEEF",7\r\nOK\r\n`),
        expected: {
            networkStatus: 1,
            tac: '002F',
            ci: '0012BEEF',
            AcTState: 7,
        },
    },
    {
        response: atPacket(
            `+CEREG: 2,1,"002F","0012BEEF",7,,,"00000001","00100010"\r\nOK\r\n`
        ),
        expected: {
            networkStatus: 1,
            tac: '002F',
            ci: '0012BEEF',
            AcTState: 7,
            powerSavingMode: {
                granted: {
                    state: 'on',
                    T3412Extended: {
                        bitmask: '00100010',
                        value: 7200,
                        unit: 'seconds',
                    },
                    T3324: {
                        bitmask: '00000001',
                        value: 2,
                        unit: 'seconds',
                    },
                },
            },
        },
    },

    // Network faults :: TODO: Need to verify if this is correct responses
    {
        response: atPacket(`+CEREG: 3,3,"002F","0012BEEF",7,12,13\r\nOK\r\n`),
        expected: {
            networkStatus: 3,
            tac: '002F',
            ci: '0012BEEF',
            AcTState: 7,
            ceregCauseType: 12,
            ceregRejectCause: 13,
        } as Partial<State>,
    },
];

test('+CEREG set commands will appropriately set the notifications status in state', () => {
    setCommands.forEach(test => {
        const result = convertPackets(test.commands);
        expect(result.networkStatusNotifications).toBe(
            test.expected.networkStatusNotifications
        );
    });
});

test('+CEREG read response sets appropriate attributes correctly', () => {
    testResponses.forEach(test => {
        const state = convertPackets([readCmd, test.response]);
        Object.entries(test.expected).forEach(([key, value]) => {
            if (key === 'powerSavingMode') {
                expect(state.powerSavingMode?.granted).toEqual(value.granted);
            } else {
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                expect(state[key as any as keyof State]).toBe(value);
            }
        });
    });
});

test('+CEREG notification sets appropriate attributes correctly', () => {
    testResponses.forEach(test => {
        const state = convertPackets([readCmd, test.response]);
        Object.entries(test.expected).forEach(([key, value]) => {
            if (key === 'powerSavingMode') {
                expect(state.powerSavingMode?.granted).toEqual(value.granted);
            } else {
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                expect(state[key as any as keyof State]).toBe(value);
            }
        });
    });
});
