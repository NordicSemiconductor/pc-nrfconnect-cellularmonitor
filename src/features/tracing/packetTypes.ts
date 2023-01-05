/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { RRCState } from '../tracingEvents/index';

export type GPRS_Timer = {
    bitmask: `${number}`;
    unit?: 'seconds' | 'minutes' | 'hours' | 'days';
    value?: number;
};

export type InterpretedJSONPacket<T> = T extends LTE_RRC ? LTE_RRC : unknown;

export type NAS_EPS = {
    dns_server_address_config: unknown;
    gprs_timer_2_T3324_value: GPRS_Timer;
    gprs_timer_3_T3412_value: GPRS_Timer;
};

export type LTE_RRC = { connection_state: RRCState };
