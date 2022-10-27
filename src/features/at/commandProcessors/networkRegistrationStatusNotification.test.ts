/**
 * @jest-environment node
 */

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import { atPacket, convertPackets } from '../testUtils';

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

const readTest = [
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
        response: atPacket(`+CEREG: 3,3,"002F","0012BEEF",7,12,12"\r\nOK\r\n`),
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

test('+CEREG read response sets appropriate attributes correctly', () => {
    readTest.forEach(test => {
        expect(
            convertPackets([test.response]).networkRegistrationStatus
        ).toEqual(test.expected);
    });
});
