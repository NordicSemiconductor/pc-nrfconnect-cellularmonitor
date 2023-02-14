/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import { State } from '../../types';
import { atPacket, convertPackets, OkPacket } from '../testUtils';

/*

READ CMD: AT+CEREG?
+CEREG: <n>,<stat>[,[<tac>],[<ci>],[<AcT>][,<cause_type>],[<reject_cause>][,[<Active-Time>],[<Periodic-TAU>]]]]
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
            status: 1,
        },
    },
    {
        response: atPacket(`+CEREG: 2,1,"002F","0012BEEF",7\r\nOK\r\n`),
        expected: {
            status: 1,
            tac: '002F',
            ci: '0012BEEF',
            AcT: 7,
        },
    },
    {
        response: atPacket(
            `+CEREG: 2,1,"002F","0012BEEF",7,,,"01100010","00100010"\r\nOK\r\n`
        ),
        expected: {
            status: 1,
            tac: '002F',
            ci: '0012BEEF',
            AcT: 7,
            activeTime: '01100010',
            periodicTAU: '00100010',
        },
    },

    // Network faults :: TODO: Need to verify if this is correct responses
    {
        response: atPacket(`+CEREG: 3,3,"002F","0012BEEF",7,12,12\r\nOK\r\n`),
        expected: {
            status: 3,
            tac: '002F',
            ci: '0012BEEF',
            AcT: 7,
            cause_type: 12,
            reject_cause: 12,
        },
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
        expect(
            convertPackets([readCmd, test.response]).networkRegistrationStatus
        ).toEqual(test.expected);
    });
});

test('+CEREG notification sets appropriate attributes correctly', () => {
    testResponses.forEach(test => {
        expect(
            convertPackets([readCmd, test.response]).networkRegistrationStatus
        ).toEqual(test.expected);
    });
});
