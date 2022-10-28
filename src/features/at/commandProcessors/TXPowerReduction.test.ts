/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Packet } from '..';
import { atPacket, convertPackets, ErrorPacket, OkPacket } from '../testUtils';

const packets = [
    {
        packets: [atPacket('AT%XEMPR=1,3,5,2,8,2,13,1'), OkPacket],
        expected: {
            ltemTXReduction: [
                { band: 5, reduction: 2 },
                { band: 8, reduction: 2 },
                { band: 13, reduction: 1 },
            ],
        },
    },
    {
        packets: [atPacket('AT%XEMPR=0,0,2'), OkPacket],
        expected: {
            nbiotTXReduction: 2,
        },
    },
    {
        packets: [atPacket('AT%XEMPR=0,2,2,1,5,0'), OkPacket],
        expected: {
            nbiotTXReduction: [
                { band: 2, reduction: 1 },
                { band: 5, reduction: 0 },
            ],
        },
    },
    {
        packets: [atPacket('AT%XEMPR=1,3,5,2,8,2,13,1'), ErrorPacket],
        expected: { ltemTXReduction: undefined, nbiotTXReduction: undefined },
    },
    {
        packets: [
            atPacket('AT%XEMPR=1,1,5,2'),
            OkPacket,
            atPacket('AT%XEMPR=0,0,2'),
            OkPacket,
        ],
        expected: {
            ltemTXReduction: [{ band: 5, reduction: 2 }],
            nbiotTXReduction: 2,
        },
    },
    {
        packets: [
            atPacket('AT%XEMPR=1,3,5,2,8,2,13,1'),
            OkPacket,
            atPacket('AT%XEMPR=0,0,2'),
            OkPacket,
            atPacket('AT%XEMPR'),
            OkPacket,
        ],
        expected: { ltemTXReduction: undefined, nbiotTXReduction: undefined },
    },
    {
        packets: [
            atPacket('AT%XEMPR?'),
            atPacket('%XEMPR:\r\n0,0,1\r\n1,2,5,2,8,2\r\nOK'),
        ],
        expected: {
            ltemTXReduction: [
                { band: 5, reduction: 2 },
                { band: 8, reduction: 2 },
            ],
            nbiotTXReduction: 1,
        },
    },
];

test('XEMPR commands work as expected', () => {
    packets.forEach(test => {
        const { ltemTXReduction, nbiotTXReduction } = {
            ...convertPackets(test.packets as Packet[]),
        };
        expect({ nbiotTXReduction, ltemTXReduction }).toEqual(test.expected);
    });
});
