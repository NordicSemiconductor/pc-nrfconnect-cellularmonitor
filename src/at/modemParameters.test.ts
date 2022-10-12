/**
 * @jest-environment node
 */

import { convert, initialState, Packet, State } from './index';

const encoder = new TextEncoder();
const encode = (txt: string) => Buffer.from(encoder.encode(txt));
const atPacket = (txt: string): Packet => ({
    format: 'at',
    packet_data: encode(txt),
});

const setCommand = atPacket('AT%XMONITOR');
const responsePackets = [
    {
        packet: atPacket(
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
const OkPacket = atPacket('OK\r\n');
const ErrorPacket = atPacket('ERROR\r\n');

const convertPackets = (
    packets: Packet[],
    previousState = initialState()
): State =>
    packets.reduce(
        (state, packet) => ({ ...state, ...convert(packet, state) }),
        previousState
    );

test('response from the setCommand sets the state according to the response', () => {
    responsePackets.forEach(({ packet, expected }) => {
        expect(convertPackets([packet]).xmonitor).toEqual(expected);
    });
});
