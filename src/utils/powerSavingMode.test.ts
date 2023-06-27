/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PowerSavingModeValues } from '../features/tracingEvents/types';
import {
    ACTIVE_TIMER_BASE_VALUES,
    parsePowerSavingMode,
    PERIODIC_TAU_BASE_VALUES,
    TAU_TYPES,
} from './powerSavingMode';

const deactivatedTimer: PowerSavingModeValues = {
    activated: false,
    bitmask: '11100000',
};

test('parsePowerSavingMode for T3412Extended (Periodic Tau)', () => {
    const valueBitmask = '01010';
    const valueDecimal = 10;
    Object.entries(PERIODIC_TAU_BASE_VALUES).forEach(
        ([multiplyerBitmask, multiplyerDecimalValue]) => {
            const expectedSeconds = multiplyerDecimalValue * valueDecimal;
            const bitmask = `${multiplyerBitmask}${valueBitmask}`;

            if (multiplyerBitmask === '111') {
                expect(
                    parsePowerSavingMode(bitmask, TAU_TYPES.SLEEP_INTERVAL)
                ).toEqual(deactivatedTimer);
            } else {
                expect(
                    parsePowerSavingMode(bitmask, TAU_TYPES.SLEEP_INTERVAL)
                ).toEqual({
                    activated: true,
                    bitmask,
                    value: expectedSeconds,
                    unit: 'seconds',
                });
            }
        }
    );
});

test('parsePowerSavingMode for T3324 (ActiveTimer)', () => {
    const valueBitmask = '01010';
    const valueDecimal = 10;
    Object.entries(ACTIVE_TIMER_BASE_VALUES).forEach(
        ([multiplyerBitmask, multiplyerDecimalValue]) => {
            const expectedSeconds = multiplyerDecimalValue * valueDecimal;
            const bitmask = `${multiplyerBitmask}${valueBitmask}`;

            if (multiplyerBitmask === '111') {
                expect(
                    parsePowerSavingMode(bitmask, TAU_TYPES.ACTIVE_TIMER)
                ).toEqual(deactivatedTimer);
            } else {
                expect(
                    parsePowerSavingMode(bitmask, TAU_TYPES.ACTIVE_TIMER)
                ).toEqual({
                    activated: true,
                    bitmask,
                    value: expectedSeconds,
                    unit: 'seconds',
                });
            }
        }
    );

    const invalidMultiplier = ['100', '011', '101', '110'];

    invalidMultiplier.forEach(multiplierBitmask => {
        expect(
            parsePowerSavingMode(
                `${multiplierBitmask}00011`,
                TAU_TYPES.ACTIVE_TIMER
            )
        ).toEqual(deactivatedTimer);
    });
});
