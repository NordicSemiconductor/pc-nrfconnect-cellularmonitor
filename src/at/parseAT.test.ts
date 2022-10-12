import { Packet } from '../state';
import { parseAT } from './parseAT';

/*
        How AT Commands are constructed: 
            
            (PREFIX)(PREFIX-EXTENSION)(COMMAND)(TYPE)
            PREFIX              : AT
            PREFIX-EXTENSION    : + or %
            COMMAND             : ...
            TYPE                : =? or ? or =

            Examples:
            SET Command:
                ==> AT+CMD=<params,>
            READ Command:
                ==> AT+CMD?
            TEST Command:
                ==> AT+CMD=?

            
            RESPONSE:
            OK<CR><LF>
            ERROR<CR><LF>
            ---- ARE THESE RELEVANT? ----
            +CME ERROR: <cause_value><CR>LF>
            +CMS ERROR: <cause_value><CR>LF>
            ---- ARE THESE RELEVANT? ----




    */

const encoder = new TextEncoder();
const encode = (txt: string) => Buffer.from(encoder.encode(txt));
const atPacket = (txt: string): Packet => ({
    format: 'at',
    packet_data: encode(txt),
});

const tests = [
    {
        packet: atPacket('AT%XT3412=1,2000,30000'),
        expected: {
            command: '%XT3412',
            operator: '=',
            body: '1,2000,30000',
            isRequest: true,
            lastLine: undefined,
            status: undefined,
        },
    },
    {
        packet: atPacket('AT%XMODEMTRACE=1,2OK'),
        expected: {
            command: '%XMODEMTRACE',
            operator: '=',
            body: '1,2OK',
            isRequest: true,
            lastLine: undefined,
            status: undefined,
        },
    },
    {
        packet: atPacket('AT+CFUN'),
        expected: {
            command: '+CFUN',
            operator: undefined,
            body: undefined,
            isRequest: true,
            lastLine: undefined,
            status: undefined,
        },
    },
    {
        packet: atPacket('%XSYSTEMMODE: 1,0,1,0\r\nOK\r\n'),
        expected: {
            command: '%XSYSTEMMODE',
            operator: undefined,
            body: `: 1,0,1,0\\r\\nOK\\r\\n`,
            isRequest: false,
            lastLine: 'OK',
            status: 'OK',
        },
    },
];

test('parseAT successfully parses packet', () => {
    tests.forEach((test) => {
        expect(parseAT(test.packet)).toEqual(test.expected);
    });
});
