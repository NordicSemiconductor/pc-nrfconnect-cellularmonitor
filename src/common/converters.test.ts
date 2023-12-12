/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { secondsToDhms } from './converters';

const ONE_MINUTE_IN_SECONDS = 60;
const ONE_HOUR_IN_SECONDS = 60 * ONE_MINUTE_IN_SECONDS;
const ONE_DAY_IN_SECONDS = 24 * ONE_HOUR_IN_SECONDS;

test('whole seconds result display string in singular', () => {
    let expected = '1 second';
    expect(secondsToDhms(1)).toBe(expected);

    expected = '1 minute';
    expect(secondsToDhms(ONE_MINUTE_IN_SECONDS)).toBe(expected);

    expected = '1 hour';
    expect(secondsToDhms(ONE_HOUR_IN_SECONDS)).toBe(expected);

    expected = '1 day';
    expect(secondsToDhms(ONE_DAY_IN_SECONDS)).toBe(expected);
});

test('Single units of duration are shown together', () => {
    let expected = '1 minute, 1 second';
    expect(secondsToDhms(ONE_MINUTE_IN_SECONDS + 1)).toBe(expected);

    expected = '1 hour, 1 minute, 1 second';
    expect(secondsToDhms(ONE_HOUR_IN_SECONDS + ONE_MINUTE_IN_SECONDS + 1)).toBe(
        expected
    );

    expected = '1 day, 1 hour, 1 minute, 1 second';
    expect(
        secondsToDhms(
            ONE_DAY_IN_SECONDS + ONE_HOUR_IN_SECONDS + ONE_MINUTE_IN_SECONDS + 1
        )
    ).toBe(expected);

    expected = '1 hour, 1 second';
    expect(secondsToDhms(ONE_HOUR_IN_SECONDS + 1)).toBe(expected);

    expected = '1 day, 1 second';
    expect(secondsToDhms(ONE_DAY_IN_SECONDS + 1)).toBe(expected);
});

test('Single unit is shown in plural if its more than one of that unit', () => {
    let expected = '3 seconds';
    expect(secondsToDhms(3)).toBe(expected);

    expected = '7 minutes';
    expect(secondsToDhms(7 * ONE_MINUTE_IN_SECONDS)).toBe(expected);

    expected = '11 hours';
    expect(secondsToDhms(11 * ONE_HOUR_IN_SECONDS)).toBe(expected);

    expected = '23 days';
    expect(secondsToDhms(23 * ONE_DAY_IN_SECONDS)).toBe(expected);
});

test('Singular units and Plurals can be combined', () => {
    let expected = '1 minute, 7 seconds';
    expect(secondsToDhms(ONE_MINUTE_IN_SECONDS + 7)).toBe(expected);

    expected = '3 days, 1 hour, 25 minutes, 1 second';
    expect(
        secondsToDhms(
            3 * ONE_DAY_IN_SECONDS +
                ONE_HOUR_IN_SECONDS +
                25 * ONE_MINUTE_IN_SECONDS +
                1
        )
    ).toBe(expected);
});

test('that the biggest TAU value can be represented as a number', () => {
    const expected = `${320 * (2 ** 5 - 1)} days`;
    const numberOfSeconds = 320 * ONE_DAY_IN_SECONDS * (2 ** 5 - 1);
    expect(secondsToDhms(numberOfSeconds)).toBe(expected);
});
