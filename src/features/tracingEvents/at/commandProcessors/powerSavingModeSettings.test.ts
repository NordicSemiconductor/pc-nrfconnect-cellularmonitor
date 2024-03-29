/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { atPacket, convertPackets, OkPacket } from '../testUtils';

/*
==> AT+CPSMS=
is a set command to turn off PSM, and also reset the timer values to manufacturer defaults.
the defaults are:
t3324      = 000 00110 = 0x21 = 1 minute
t3412ext   = 001 00001 = 0x06 = 60 minutes
*/

const CPSMS = 'AT+cpsms';

const defaultT3324 = '00100001';
const notDefaultT3324 = '00100011';

const defaultT3412Extended = '00000110';
const notDefaultT3412Extended = '10101010';

const DISABLED = '11100000';

test('AT+CPSMS=1 with only mode argument will use default values for t3324 and t3412ext', () => {
    let state = convertPackets([atPacket(`${CPSMS}=1`), OkPacket]);

    expect(state.powerSavingMode?.requested?.T3324?.bitmask).toBe(defaultT3324);
    expect(state.powerSavingMode?.requested?.T3412Extended?.bitmask).toBe(
        defaultT3412Extended
    );

    state = convertPackets([atPacket(`${CPSMS}=0`), OkPacket]);

    state = convertPackets([
        atPacket(
            `${CPSMS}=1,"","","${notDefaultT3412Extended}","${notDefaultT3324}"`
        ),
        OkPacket,
    ]);
    expect(state.powerSavingMode?.requested?.T3324?.bitmask).toBe(
        notDefaultT3324
    );
    expect(state.powerSavingMode?.requested?.T3412Extended?.bitmask).toBe(
        notDefaultT3412Extended
    );

    // Try to reset to default, to check if "AT+CPSMS=" command is interpreted correctly:
    state = convertPackets([atPacket(`${CPSMS}=`), OkPacket]);
    expect(state.powerSavingMode?.requested?.T3324?.bitmask).toBe(DISABLED);
    expect(state.powerSavingMode?.requested?.T3412Extended?.bitmask).toBe(
        DISABLED
    );

    // Then check if the defaults are still used when using the short term on command
    state = convertPackets([atPacket(`${CPSMS}=1`), OkPacket]);
    expect(state.powerSavingMode?.requested?.T3324?.bitmask).toBe(defaultT3324);
    expect(state.powerSavingMode?.requested?.T3412Extended?.bitmask).toBe(
        defaultT3412Extended
    );
});

test('AT+CPSMS? read command will update the state appropriately', () => {
    let [t3412ext, t3324] = ['00000100', '00001111'];

    let state = convertPackets([
        atPacket(`${CPSMS}?`),
        atPacket(`+CPSMS: 1,,,"${t3412ext}","${t3324}"\r\nOK\r\n`),
    ]);
    expect(state.powerSavingMode?.requested?.T3412Extended?.bitmask).toBe(
        t3412ext
    );
    expect(state.powerSavingMode?.requested?.T3324?.bitmask).toBe(t3324);

    [t3412ext, t3324] = ['10101010', '00101010'];
    state = convertPackets([
        atPacket(`${CPSMS}?`),
        atPacket(`+CPSMS: 1,,,"${t3412ext}","${t3324}"\r\nOK\r\n`),
    ]);
    expect(state.powerSavingMode?.requested?.T3412Extended?.bitmask).toBe(
        t3412ext
    );
    expect(state.powerSavingMode?.requested?.T3324?.bitmask).toBe(t3324);
});

// test('AT+CPSMS= compared to AT+CPSMS=0', () => {
test('This should be easy to find', () => {
    const [t3412ext, t3324] = ['10101011', '00101010'];

    let state = convertPackets([atPacket(`${CPSMS}=1`), OkPacket]);
    expect(state.powerSavingMode?.requested?.T3324?.bitmask).toBe(defaultT3324);
    expect(state.powerSavingMode?.requested?.T3412Extended?.bitmask).toBe(
        defaultT3412Extended
    );

    state = convertPackets(
        [atPacket(`${CPSMS}=1,,,"${t3412ext}","${t3324}"`), OkPacket],
        state
    );
    expect(state.powerSavingMode?.requested?.T3412Extended?.bitmask).toBe(
        t3412ext
    );
    expect(state.powerSavingMode?.requested?.T3324?.bitmask).toBe(t3324);

    state = convertPackets([atPacket(`${CPSMS}=0`), OkPacket], state);
    expect(state.powerSavingMode?.requested?.T3412Extended?.bitmask).toBe(
        DISABLED
    );
    expect(state.powerSavingMode?.requested?.T3324?.bitmask).toBe(DISABLED);

    // Verify that since AT+CPSMS=0 was sent, we persist the last requested parameters.
    state = convertPackets([atPacket(`${CPSMS}=1`), OkPacket], state);
    expect(state.powerSavingMode?.requested?.T3412Extended?.bitmask).toBe(
        t3412ext
    );
    expect(state.powerSavingMode?.requested?.T3324?.bitmask).toBe(t3324);

    state = convertPackets([atPacket(`${CPSMS}=`), OkPacket], state);
    expect(state.powerSavingMode?.requested?.T3412Extended?.bitmask).toBe(
        DISABLED
    );
    expect(state.powerSavingMode?.requested?.T3324?.bitmask).toBe(DISABLED);

    // verify that since AT+CPSMS= was sent, then turning it back on requests default values.
    state = convertPackets([atPacket(`${CPSMS}=1`), OkPacket], state);
    expect(state.powerSavingMode?.requested?.T3324?.bitmask).toBe(defaultT3324);
    expect(state.powerSavingMode?.requested?.T3412Extended?.bitmask).toBe(
        defaultT3412Extended
    );
});
