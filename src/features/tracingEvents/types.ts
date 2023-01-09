import type { AttachPacket } from './nas/index';

export const assertIsNasPacket = (packet: Packet): packet is NasPacket =>
    packet.format === 'nas-eps' && packet.interpreted_json !== undefined;

type NasPacket = Omit<Packet, 'interpreted_json'> & {
    interpreted_json: { 'nas-eps': AttachPacket };
};

export interface Packet {
    packet_data: Uint8Array;
    format: PacketFormat;
    timestamp?: {
        resolution?: string;
        value?: number;
    };
    type?: string;
    meta?: unknown;
    interpreted_json?: { 'nas-eps': AttachPacket };
    sequence_number: number;
}

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
    xmonitor: {
        regStatus: number;
        operatorFullName: string;
        operatorShortName: string;
        plmn: string;
        tac: string;
        AcT: number;
        band: number;
        cell_id: string;
        phys_cell_id: number;
        EARFCN: number;
        rsrp: number;
        snr: number;
        NW_provided_eDRX_value: string;
        activeTime: `${number}`;
        periodicTAU: `${number}`;
        periodicTAUext: `${number}`;
    };
    pinCodeStatus: string;
    functionalMode: number;
    IMEI: `${number}`;
    manufacturer: string;
    revisionID: `mfw_${string}_${number}.${number}.${number}`;
    modeOfOperation: number;
    availableBands: number[];
    pinRetries: { SIM_PIN: number };
    imsi: `${number}`;
    iccid: string;
    currentBand: number;
    periodicTAU: string;
    hardwareVersion: unknown;
    modemUUID: unknown;
    dataProfile: unknown;
    nbiotTXReduction: unknown;
    ltemTXReduction: unknown;
    activityStatus: unknown;
    networkRegistrationStatus: {
        status: number;
        tac: `${number}`;
        ci: `${number}`;
        AcT: number;
    };

    // TODO: Revise above state attributes.
    // New state attributes under:
    powerSavingMode: {
        requested?: PowerSavingModeEntries;
        granted?: PowerSavingModeEntries;
    };

    accessPointNames: AccessPointName[];

    mnc: string;
    mnc_code: number;
    mcc: string;
    mcc_code: number;
}

export interface AccessPointName {
    apn?: string;
    pdnType?: PDNType;
    rawPDNType?: RawPDNType;
    ipv4?: IPv4Address;
    ipv6Postfix?: IPv6Address;
    ipv6Prefix?: IPv6Address;
    info?: 'IPv4 Only' | 'IPv6 Only';
}

// Need to be cast from RawPDNType with parsePDNType function
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
export type IPv6Address =
    `${string}:${string}:${string}:${string}:${string}:${string}:${string}:${string}`;

export type PowerSavingModeEntries = {
    [timer: TimerKey]: PowerSavingModeValues;
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
