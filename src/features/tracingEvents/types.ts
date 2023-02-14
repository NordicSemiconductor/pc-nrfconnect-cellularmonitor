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

export type PacketFormat =
    | 'at'
    | 'nas-eps'
    | `lte-rrc.${string}`
    | 'ip'
    | 'modem_trace';

export interface State {
    notifySignalQuality: boolean;
    notifyPeriodicTAU: boolean;
    regStatus?: number;
    operatorFullName?: string;
    operatorShortName?: string;
    xmonitor?: {
        tac?: string;
        band?: number;
        cell_id?: string;
        phys_cell_id?: number;
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
    imsi?: string;
    iccid?: string;
    currentBand?: number;
    periodicTAU: number;
    hardwareVersion?: string;
    modemUUID?: string;
    dataProfile?: PowerLevel;
    nbiotTXReduction?: TXReductionMode;
    ltemTXReduction?: TXReductionMode;
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
    powerSavingMode?: {
        requested?: PowerSavingModeEntries;
        granted?: PowerSavingModeEntries;
    };

    accessPointNames: AccessPointName[];

    mnc: string;
    mncCode: number;
    mcc: string;
    mccCode: number;

    // XModemTrace
    xModemTraceOperation?: number;
    xModemTraceSetID?: number;

    // XSystemMode
    modemSupportLTEM: boolean;
    modemSupportNBIoT: boolean;
    modemSupportGNSS: boolean;
    modemSystemPreference: number;

    // CEREG - Network Registration Status Notification
    networkStatusNotifications: NetworkStatusNotifications;
    // +CSCON
    signalingConnectionStatusNotifications: SignalingConnectionStatusNotifications;

    // Evaluating Connection Parameters %CONEVAL
    conevalResult?: ConnectionEvaluationResult;
    conevalEnergyEstimate?: ConevalEnergyEstimate;
    rrcState?: RRCState;
    signalQuality?: {
        rsrp?: number;
        rsrp_threshold_index?: number;
        rsrp_decibel?: number;
        rsrq?: number;
        rsrq_threshold_index?: number;
        rsrq_decibel?: number;
        snr?: number;
    };
    cellID: string; // 4-byte E-UTRAN cell ID.
    physicalCellID?: number; // Integer [0, 503]
    earfcn?: number;
    AcT?: number;
    plmn?: string; // Actually just <MCC + MNC>
    band?: number; // 0 = unavailable, Integer [0, 88]
    TAUTriggered?: TAUTriggered;

    // Don't actually know if ce=Cell Evaluation
    conevalCellEvaluationLevel?: CellEvaluationLevel;
    conevalTXPower?: number;
    conevalTXRepetitions?: number; // Integer [1, 2048], special 0 and 1.
    conevalRXRepetitions?: number; // Integer [1, 2048], special 0 and 1.
    conevalDLPathLoss?: number;

    // %MDMEV Modem Domain Event Notification
    mdmevNotification?: 0 | 1;
    modemDomainEvents: string[];

    // %CONNSTAT Connectivity Statistics state
    connStat?: {
        collecting?: boolean;
        smsTX?: number; // Indicate the total number of SMSs successfully transmitted during the collection period
        smsRX?: number; // Indicate the total number of SMSs successfully received during the collection period
        dataTX?: number; // Indicate the total amount of data (in kilobytes) transmitted during the collection period
        dataRX?: number; // Indicate the total amount of data (in kilobytes) received during the collection period
        packetMax?: number; // The maximum packet size (in bytes) used during the collection period
        packetAverage?: number; // The average packet size (in bytes) used during the collection period
    };

    // +CEDRXRDP eDRX Dynamic Parameters
    AcTState?: AcTState;
    requested_eDRX_value: string; // 4 bit string
    NW_provided_eDRX_value: string; // 4 bit string
    pagingTimeWindow: string; // 4 bit string: calculation of value different depending on LTE-M or NB-IoT

    // %XTIME Network Time Notification
    networkTimeNotifications?: 0 | 1;
    networkTimeNotification?: {
        // All fields are optional
        localTimeZone?: string; // 1 byte in hexadecimal string
        universalTime?: string; // 7 bytes in hexadecimal string
        daylightSavingTime?: string; // 1 byte in hexadecimal string
    };
}

export type AcTState = 0 | 4 | 5;
export const isValidAcTState = (state: number): state is AcTState => {
    if ([0, 4, 5].includes(state)) {
        return true;
    }
    return false;
};

/*
    Several responses to AT commands have a set of result code: e.g. NetworkStatusNotifications = [0, 5].
    Would like a type Generic with an included interval [1, 2] => 1 | 2, [0, 4] => 0 | 1 | 2 | 3 | 4, and so on...
*/
// export type ResultCode<From extends number, To extends number> = ;
export type RRCState =
    | 0 // In IDLE state.
    | 1 // In Connected state.
    | undefined;
export type NetworkStatusNotifications = 0 | 1 | 2 | 3 | 4 | 5 | undefined;
export type ConnectionEvaluationResult =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | undefined;
// Higher values means smaller energy consumption.
export type ConevalEnergyEstimate = 5 | 6 | 7 | 8 | 9 | undefined;
export type CellEvaluationLevel = 0 | 1 | 2 | 3 | 255 | undefined;
export type TAUTriggered = 0 | 1 | 255 | undefined;

export type SignalingConnectionStatusNotifications = 0 | 1 | 2 | 3 | undefined;

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
    state?: 'on' | 'off';
    // Also known as 'Active Time'
    T3324?: PowerSavingModeValues;
    T3324Extended?: PowerSavingModeValues;
    T3402?: PowerSavingModeValues;
    T3402Extended?: PowerSavingModeValues;
    T3412?: PowerSavingModeValues;
    // Also known as 'Periodic TAU'
    T3412Extended?: PowerSavingModeValues;
};

export type TimerKey = `${string}${Timers}${string}`;

export type PowerSavingModeValues = {
    bitmask: Bitmask;
    unit?: TimeUnits;
    value?: number;
};

export const isValidBitmask = (bitmask: string): bitmask is Bitmask =>
    bitmask != null &&
    bitmask
        .split('')
        .every(character => character === '0' || character === '1');

// TODO: Is this a really bad idea?
export type Bitmask = `${0 | 1}${0 | 1}${0 | 1}${0 | 1}${0 | 1}${0 | 1}${
    | 0
    | 1}${0 | 1}`;
type TimeUnits = 'seconds' | 'minutes' | 'decihours' | 'hours' | 'days';

type T_Keys = 'T3324' | 'T3402' | 'T3412';
type Extended = '' | 'Extended';
export type Timers = `${T_Keys}${Extended}`;
