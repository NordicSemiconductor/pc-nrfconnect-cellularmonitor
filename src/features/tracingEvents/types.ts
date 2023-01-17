/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Packet } from '../tracing/tracePacketEvents';
import { PowerLevel } from './at/commandProcessors/dataProfile';
import { ActivityStatus } from './at/commandProcessors/deviceActivityStatus';
import { Mode as TXReductionMode } from './at/commandProcessors/TXPowerReduction';
import type { AttachPacket } from './nas/index';

export const assertIsNasPacket = (packet: Packet): packet is NasPacket =>
    packet.format === 'nas-eps' && packet.interpreted_json !== undefined;

type NasPacket = Omit<Packet, 'interpreted_json'> & {
    interpreted_json: { 'nas-eps': AttachPacket };
};

export type RRCState =
    | 'rrcConnectionSetupRequest'
    | 'rrcConnectionSetup'
    | 'rrcConnectionSetupComplete'
    | 'rrcConnectionRelease';

export type PacketFormat =
    | 'at'
    | 'nas-eps'
    | `lte-rrc.${string}`
    | 'ip'
    | 'modem_trace';

export interface State {
    notifySignalQuality: boolean;
    signalQuality: {
        rsrp: number;
        rsrp_threshold_index: number;
        rsrp_decibel: number;
        rsrq: number;
        rsrq_threshold_index: number;
        rsrq_decibel: number;
    };
    notifyPeriodicTAU: boolean;
    xmonitor?: {
        regStatus?: number;
        operatorFullName?: string;
        operatorShortName?: string;
        plmn?: string;
        tac?: string;
        AcT?: number;
        band?: number;
        cell_id?: string;
        phys_cell_id?: number;
        EARFCN?: number;
        rsrp?: number;
        snr?: number;
        NW_provided_eDRX_value?: string;
        activeTime?: string;
        periodicTAU?: string;
        periodicTAUext?: string;
    };
    pinCodeStatus: string;
    functionalMode: number;
    IMEI: string;
    manufacturer: string;
    revisionID: string;
    modeOfOperation: number;
    availableBands: number[];
    pinRetries: {
        SIM_PIN?: number;
        SIM_PUK?: number;
        SIM_PIN2?: number;
        SIM_PUK2?: number;
    };
    imsi: string;
    iccid: string;
    currentBand: number;
    periodicTAU: number;
    hardwareVersion?: string;
    modemUUID?: string;
    dataProfile: PowerLevel;
    nbiotTXReduction: TXReductionMode;
    ltemTXReduction: TXReductionMode;
    activityStatus: ActivityStatus;
    networkRegistrationStatus: {
        status?: number;
        tac?: string;
        ci?: string;
        AcT?: number;
    };

    // TODO: Revise above state attributes.
    // New state attributes under:
    networkType: NetworkType;
    powerSavingMode: {
        requested?: PowerSavingModeEntries;
        granted?: PowerSavingModeEntries;
    };

    accessPointNames: AccessPointName[];

    mnc: string;
    mncCode: number;
    mcc: string;
    mccCode: number;
    rrcState: RRCState;
}

export interface AccessPointName {
    apn?: string;
    pdnType?: PDNType;
    rawPDNType?: RawPDNType;
    ipv4?: IPv4Address;
    ipv6?: IPv6Address | undefined;
    ipv6Postfix?: IPv6Partial | undefined;
    ipv6Prefix?: IPv6Partial | undefined;
    // First IPv6 postfix is retrieved from Attach Accept, and ipv6Complete=false
    // Then IPv6 prefix is retrieved from an IP packet, and ipv6Complete is set to true.
    ipv6Complete: boolean;
    info?: 'IPv4 Only' | 'IPv6 Only';
}

// Need to be cast from RawPDNType with parsePDNType function
export type NetworkType = 'NB-IoT' | 'LTE-M';
export type PDNType = 'IPv4' | 'IPv6' | 'IPv4v6' | 'Non IP';
export type RawPDNType = '1' | '2' | '3' | '4';

export const parseCrudePDN = (rawPDN: unknown): RawPDNType => {
    if (rawPDN === '1') return rawPDN;
    if (rawPDN === '2') return rawPDN;
    if (rawPDN === '3') return rawPDN;
    if (rawPDN === '4') return rawPDN;
    return null as never;
};

export const parsePDNType = (rawType: RawPDNType): PDNType => {
    if (rawType === '1') return 'IPv4';
    if (rawType === '2') return 'IPv6';
    if (rawType === '3') return 'IPv4v6';
    if (rawType === '4') return 'Non IP';
    return null as never;
};

export type IPv4Address = `${number}.${number}.${number}.${number}`;
export type IPv6Partial = `${string}:${string}:${string}:${string}`;
export type IPv6Address = `${IPv6Partial}:${IPv6Partial}`;

export type GeneratedPowerSavingModeEntries = {
    [timer: TimerKey]: PowerSavingModeValues;
};
export type PowerSavingModeEntries = {
    // Also known as 'Active Time'
    T3324?: PowerSavingModeValues;
    T3324_extended?: PowerSavingModeValues;
    T3402?: PowerSavingModeValues;
    T3402_extended?: PowerSavingModeValues;
    T3412?: PowerSavingModeValues;
    // Also known as 'Periodic TAU'
    T3412_extended?: PowerSavingModeValues;
};

export type TimerKey = `${string}${Timers}${string}`;

export type PowerSavingModeValues = {
    bitmask: Binary;
    unit?: TimeUnits;
    value?: number;
};

// TODO: Is this a really bad idea?
type Binary = `${0 | 1}${0 | 1}${0 | 1}${0 | 1}${0 | 1}${0 | 1}${0 | 1}${
    | 0
    | 1}`;
type TimeUnits = 'seconds' | 'minutes' | 'decihours' | 'hours' | 'days';

type T_Keys = 'T3324' | 'T3402' | 'T3412';
type Extended = '' | '_extended';
export type Timers = `${T_Keys}${Extended}`;
