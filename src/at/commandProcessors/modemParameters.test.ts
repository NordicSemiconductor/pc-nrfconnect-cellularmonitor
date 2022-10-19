/**
 * @jest-environment node
 */

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets } from '../testUtils';

const packets = [
    {
        command: atPacket('AT%XMONITOR'),
        response: atPacket(
            '%XMONITOR: 5,"Telia N@","Telia N@","24202","0901",7,20,"02024720",428,6300,53,22,"","11100000","11100000","01001001"\r\nOK'
        ),
        expected: {
            regStatus: 5,
            operatorFullName: 'Telia N@',
            operatorShortName: 'Telia N@',
            plmn: '24202',
            tac: '0901',
            AcT: 7,
            band: 20,
            cell_id: '02024720',
            phys_cell_id: 428,
            EARFCN: 6300,
            rsrp: 53,
            snr: 22,
            NW_provided_eDRX_value: '',
            activeTime: '11100000',
            periodicTAUext: '11100000',
            periodicTAU: '01001001',
        },
    },
];

test('response from the setCommand sets the state according to the response', () => {
    packets.forEach(test => {
        expect(convertPackets([test.command, test.response]).xmonitor).toEqual(
            test.expected
        );
    });
});
