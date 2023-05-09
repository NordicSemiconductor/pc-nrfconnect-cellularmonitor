/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Packet } from '../tracing/tracePacketEvents';
import { PowerLevel } from './at/commandProcessors/dataProfile';
import { ActivityStatus } from './at/commandProcessors/deviceActivityStatus';
import { Mode as TXReductionMode } from './at/commandProcessors/TXPowerReduction';
import type { AttachPacket } from './nas/types';

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
    uiccInitialised?: boolean;
    uiccInitialisedErrorCause?: string;
    uiccInitialisedErrorCauseCode?: number;
    notifySignalQuality: boolean;
    notifyPeriodicTAU: boolean;
    regStatus?: number;
    operatorFullName?: string;
    operatorShortName?: string;
    tac?: string;
    cell_id?: string;
    phys_cell_id?: number;
    rsrp?: number;
    snr?: number;
    activeTime?: string;
    periodicTAU?: string;
    periodicTAUext?: string;
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
    hardwareVersion?: string;
    modemUUID?: string;
    dataProfile?: PowerLevel;
    nbiotTXReduction?: TXReductionMode;
    ltemTXReduction?: TXReductionMode;
    activityStatus: ActivityStatus;
    networkStatus?: number;
    ci?: string;
    ceregCauseType: number;
    ceregRejectCause: number;

    // TODO: Revise above state attributes.
    // New state attributes under:
    networkType: NetworkType;
    powerSavingMode?: {
        requested?: PowerSavingModeEntries;
        granted?: PowerSavingModeEntries;
    };

    accessPointNames: { [key: string]: AccessPointName };

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

    // Read from LTE NAS packets
    lteState?: LTEState;
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
    plmnMode?: PlmnMode;
    plmnFormat?: PlmnFormat;
    plmn?: string; // Actually just <MCC + MNC>
    availablePlmns?: AvailablePlmn[];
    band?: number; // 0 = unavailable, Integer [0, 88]
    TAUTriggered?: TAUTriggered;

    // Don't actually know if ce=Cell Evaluation
    conevalCoverageEnhancementLevel?: CoverageEnhancementLevel;
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
    requested_eDRX_value: string; // 4 bit string (either NB-iot or LTE-M)
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

export enum PlmnStatus {
    Available = 0,
    Current = 1,
    Forbidden = 2,
    Unknown = 3,
}

export type AvailablePlmn = {
    stat: PlmnStatus;
    longOperatorName: string;
    shortOperatorName: string;
    operatorNumeric: string;
    AcTState?: AcTState;
};

export type PlmnMode =
    | 0 // Automatic network selection
    | 1 // Manual network selection
    | 2 // Deregister from the network
    | 3; // Set only format of <oper>

export type PlmnFormat =
    | 0 // Long alphanumeric format (only for plmnMode 3)
    | 1 // Short alphanumeric format (only for plmnMode 3)
    | 2; // Numeric format

export type LTEState = 'IDLE' | 'CONNECTED' | 'HANDOVER';

export type AcTState = 0 | 4 | 5 | 7 | 9;
export const isValidAcTState = (state: number): state is AcTState => {
    if ([0, 4, 5, 7, 9].includes(state)) {
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
export type CoverageEnhancementLevel = 0 | 1 | 2 | 3 | 255 | undefined;
export type TAUTriggered = 0 | 1 | 255 | undefined;

export type SignalingConnectionStatusNotifications = 0 | 1 | 2 | 3 | undefined;

export interface AccessPointName {
    // Identification properties
    cid?: number;
    imsi?: string;
    bearerId?: string;
    apn?: string;

    state?:
        | 'PDN Connectivity Request'
        | 'Activate Default EPS Bearer Context Request'
        | 'Activate Default EPS Bearer Context Accept'
        | 'PDN Connectivity Reject';
    cause?: Cause;
    defaultApn?: boolean;
    pdnType?: string;
    rawPDNType?: RawPDNType;
    ipv4?: IPv4Address;
    ipv6?: IPv6Address | undefined;
    ipv6Postfix?: IPv6Partial | undefined;
    ipv6Prefix?: IPv6Partial | undefined;
    // First IPv6 postfix is retrieved from Attach Accept, and ipv6Complete=false
    // Then IPv6 prefix is retrieved from an IP packet, and ipv6Complete is set to true.
    ipv6Complete?: boolean;
    info?: 'IPv4 Only' | 'IPv6 Only';
}

// Need to be cast from RawPDNType with parsePDNType function
export type NetworkType = 'NB-IoT' | 'LTE-M';
// export type PDNType = 'IPv4' | 'IPv6' | 'IPv4v6' | 'Non IP';
export type RawPDNType = '1' | '2' | '3' | '4';
export type Cause = {
    code: number;
    reason: string;
};

export const parseRawPDN = (rawPDN: unknown): RawPDNType => {
    if (rawPDN === '1') return rawPDN;
    if (rawPDN === '2') return rawPDN;
    if (rawPDN === '3') return rawPDN;
    if (rawPDN === '4') return rawPDN;
    return null as never;
};

export const parsePDNType = (rawType: RawPDNType): string => {
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
    // Also known as Periodic TAU (Legacy)
    T3412?: PowerSavingModeValues;
    // Also known as 'Periodic TAU'
    T3412Extended?: PowerSavingModeValues;
    // Notification from %XT3412
    // indicates how much is left of Periodic TAU
    T3412ExtendedNotification?: number;
};

export type TimerKey = `${string}${Timers}${string}`;

export const PowerSavingModeDeactivatedTimer: PowerSavingModeValues = {
    activated: false,
    bitmask: '11100000',
};
export type PowerSavingModeValues = {
    bitmask: Bitmask;
    activated?: boolean;
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
// export type PowerSavingModeTimer = 'T3324' | 'T3412' | 'T3412Extended';
