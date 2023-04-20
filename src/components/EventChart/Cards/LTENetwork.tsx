/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { getDashboardState } from '../../../features/tracingEvents/dashboardSlice';
import type {
    AcTState,
    NetworkStatusNotifications,
    SignalingConnectionStatusNotifications,
} from '../../../features/tracingEvents/types';
import DashboardCard, { DashboardCardFields } from './DashboardCard';

export default () => {
    const {
        AcTState,
        rrcState,
        signalQuality,
        networkStatus,
        activityStatus,
        mcc,
        mccCode,
        mnc,
        mncCode,
        networkType,
        earfcn,

        // +CEREG Notifications
        networkStatusNotifications,

        // +CSCON Notifications
        signalingConnectionStatusNotifications,

        // +CEDRXRDP
        /* eslint-disable camelcase */
        requested_eDRX_value,
        NW_provided_eDRX_value,
        pagingTimeWindow,

        // %XTIME
        networkTimeNotifications,
        networkTimeNotification,

        // %CONEVAL
        conevalResult,
        conevalEnergyEstimate,
        cellID,
        plmnMode,
        plmnFormat,
        plmn,
        physicalCellID,
        band,
        conevalCoverageEnhancementLevel,
        conevalTXPower,
        conevalTXRepetitions,
        conevalRXRepetitions,
        conevalDLPathLoss,
    } = useSelector(getDashboardState);

    const fields: DashboardCardFields = {
        ACT: {
            value:
                AcTState !== undefined ? parseModeFromAcT(AcTState) : 'Unknown',
            description: `AcT (Access Technology) refers to the current operational state of a mobile device's cellular network connection. It indicates which type of cellular technology (e.g. LTE-M or NB-IoT) the device is currently using to connect to the network.`,
            commands: ['AT+CEREG', 'AT%XMONITOR', 'AT+CEDRXRDP'],
        },
        'ACT STATE': {
            value: AcTState ?? 'Unknown',
            description: `The Access Technology (AcT) state indicates the current operational state of a mobile device's cellular network connection. It indicates which type of cellular technology (e.g. LTE-M or NB-IoT) the device is currently using to connect to the network.`,
            commands: ['AT+CEDRXRDP'],
        },
        // TODO: need to look into how to properly get correct value for this
        'RRC STATE': {
            value: parseRRCState(rrcState),
            description: `RRC (Radio Resource Control) State refers to the state of the radio resources being used by a mobile device's cellular network connection. It indicates whether the device is in an active or idle state.`,
            commands: ['AT%CONEVAL', 'AT+CSCON'],
        },
        'NETWORK TYPE': {
            value: networkType ?? 'Unknown',
            description:
                'Same as AcT (Access Technology) State, but derived from IP packet, in contrast to the fields above, which are derived from AT commands.  ',
            commands: [],
        },
        MNC: {
            value: parseMCC(mnc, mncCode),
            description:
                'Mobile Network Code (MNC) is a code  identifying the telecommunications network. The code is defined by ITU-T Recommendation E.212, consists of two or three decimal digits, and is used together with the Mobile Country Code (MCC)',
            commands: [],
        },
        MCC: {
            value: parseMCC(mcc, mccCode),
            description:
                'Mobile Country Code (MCC) is a unique three-digit part of an IMSI code identifying the country of domicile of the mobile subscriber. MCC is used together with the Mobile Network Code (MNC).',
            commands: [],
        },
        EARFCN: {
            value: earfcn ?? 'Unknown',
            description:
                'E-UTRA Absolute Radio Frequency Channel Number (EARFCN), is an LTE carrier channel number for unique identification of LTE band and carrier frequency.',
            commands: ['AT%CONEVAL'],
        },
        RSRP: {
            value: signalQuality?.rsrp_decibel ?? 'Unknown',
            description:
                'Reference Signal Received Power (RSRP), is the average power level received from a single reference signal in an LTE (Long-Term Evolution) network.',
            commands: ['AT%CESQ'],
        },
        RSRQ: {
            value: signalQuality?.rsrq_decibel ?? 'Unknown',
            description:
                'Reference Signal Received Quality (RSRQ), is the quality of a single reference signal received in an LTE (Long-Term Evolution) network and calculated from RSRP.',
            commands: ['AT%CESQ'],
        },
        // TODO: Do we need to change to decibel, and then replace the two above?
        'SIGNAL QUALITY (RSRP)': {
            value: signalQuality?.rsrp ?? 'Unknown',
            description:
                'Reference Signal Received Power (RSRP), is the average power level received from a single reference signal in an LTE (Long-Term Evolution) network.',
            commands: ['AT%CONEVAL'],
        },
        'SIGNAL QUALITY (RSRQ)': {
            value: signalQuality?.rsrq ?? 'Unknown',
            description:
                'Reference Signal Received Quality (RSRQ), is the quality of a single reference signal received in an LTE (Long-Term Evolution) network and calculated from RSRP.',
            commands: ['AT%CONEVAL'],
        },
        'SIGNAL QUALITY (SNR)': {
            value: signalQuality?.snr ?? 'Unknown',
            description:
                'Signal-to-Noise Ratio (SNR), returned by the AT command %CONEVAL, is a measure of the quality of the cellular signal received by the mobile device. It represents the ratio of the signal power to the noise power present in the received signal. A higher SNR value indicates a better quality signal with less noise, while a lower value indicates a weaker or noisier signal.',
            commands: ['AT%CONEVAL'],
        },
        'NETWORK STATUS NOTIFICATIONS': {
            value: parseNotificationStatus(networkStatusNotifications),
            description:
                'The +CEREG command subscribes unsolicited network status notifications. Possible values are 0 (disabled), 1 (enabled), 2 (enabled with location information), 3 (same as 2, but with cause and reject type), 4 (same as 2, but with PSM values), 5 (same as 3, but with PSM values).',
            commands: ['AT+CEREG'],
        },
        'SIGNALING CONNECTING STATUS NOTIFICATIONS': {
            value: parseNotificationStatus(
                signalingConnectionStatusNotifications
            ),
            description:
                'The +CSCON command subscribes and configures unsolicited result code notifications',
            commands: ['AT+CSCON'],
        },
        // TODO: To be removed?
        'ACTIVITY STATUS': {
            value: activityStatus ?? 'Unknown',
            description: `The AT command +CPAS (Device Activity Status) is used to query the current state of a mobile device's radio interface. This command returns a value that indicates whether the device is currently in one of the following states:

        0: Device is powered off
        1: Device is powered on and is not currently searching for a network
        2: Device is currently searching for a network to register with
        3: Device is currently registering with a network
        4: Device is registered with a network and is currently idle
        5: Device is currently engaged in a data call or voice call
        6: Device is in a reserved state
        `,
            commands: ['AT+CPAS'],
        },
        'EPS NETWORK REGISTRATION STATUS': {
            value: networkStatus ?? 'Unknown',
            description:
                'The EPS Network Registration Status field indicates whether a mobile device is currently registered with a cellular network, and if so, which network it is registered with. This information can be useful for ensuring that the device is able to communicate with other devices and services over the network, and for troubleshooting connection issues.',
            commands: [],
        },
        /* eslint-disable camelcase */
        'REQUESTED EDRX': {
            value: requested_eDRX_value ?? 'Unknown',
            description:
                'The requested eDRX value is a value that is requested by the mobile device during its registration process with the cellular network. This value indicates the desired eDRX (extended Discontinuous Reception) cycle length that the device would like to use in order to conserve power while maintaining an acceptable level of network connectivity.',
            commands: ['AT+CEDRXRDP'],
        },
        'NW PROVIDED EDRX': {
            value: NW_provided_eDRX_value ?? 'Unknown',
            description:
                'The NW Provided eDRX value is a value that is provided by the cellular network to a mobile device during its registration process. This value indicates the suggested eDRX (extended Discontinuous Reception) cycle length that the device should use in order to conserve power while maintaining a reasonable level of network connectivity.',
            commands: ['AT+CEDRXRDP'],
        },
        'PAGING TIME WINDOW': {
            value: pagingTimeWindow ?? 'Unknown',
            description:
                'Paging Time Window (PTW), is the period of time during which the User Equipment (UE) attempts to receive a paging message.',
            commands: ['AT+CEDRXRDP'],
        },

        'NETWORK TIME NOTIFICATIONS': {
            value: parseNotificationStatus(networkTimeNotifications),
            commands: ['AT%XTIME'],
        },
        'LOCAL TIME ZONE': {
            value: networkTimeNotification?.localTimeZone ?? 'Unknown',
            commands: ['AT%XTIME'],
        },
        'UNIVERSAL TIME': {
            value: networkTimeNotification?.universalTime ?? 'Unknown',
            commands: ['AT%XTIME'],
        },
        'DAYLIGHT SAVING TIME': {
            value: networkTimeNotification?.daylightSavingTime ?? 'Unknown',
            commands: ['AT%XTIME'],
        },
        'CONNECTION EVALUATION RESULT': {
            value: conevalResult ?? 'Unknown',
            description: `Possible result values are: 0="Connection pre-evaluation successful", 1="No Cell Available", 2="UICC not available", 3="Only barred cells available", 4="Busy (for example, GNSS activity)", 5="Aborted because of higher priority operation", 6="Not registered", 7="Unspecified".`,
            commands: ['AT%CONEVAL'],
        },
        'ENERGY ESTIMATE': {
            value: conevalEnergyEstimate ?? 'Unknown',
            description:
                'Energy Estimate is a useful parameter for estimating the overall quality of the received signal and for assessing the suitability of the signal for use in data transmission. In general, a higher Energy Estimate value indicates a stronger and more reliable signal. However, the actual interpretation of the Energy Estimate value depends on the specific use case and the requirements of the application.',
            commands: ['AT%CONEVAL'],
        },
        'CELL ID': {
            value: cellID ?? 'Unknown',
            description:
                'The Cell ID is a unique identifier assigned to the cellular base station that is currently serving the mobile device. It can be used to identify the specific base station that the device is connected to and can be useful for location tracking and network optimization.',
            commands: ['AT%CONEVAL'],
        },
        PLMN: {
            value: plmn ?? 'Unknown',
            description:
                'PLMN (Public Land Mobile Network) is the name of the network that the device is connected to.',
            commands: ['AT+COPS', 'AT%CONEVAL'],
        },
        'PLMN MODE': {
            value: plmnMode ?? 'Unknown',
            description:
                'PLMN mode (Public Land Mobile Network mode) is a setting that determines how a mobile device selects and connects to a cellular network. It can be set to one of three modes: automatic, manual, or deregister. In automatic mode, the device automatically selects and connects to the best available network based on its signal strength and other factors. In manual mode, the device only connects to a network that has been manually selected by the user. In deregister mode, the device disconnects from the current network and deregisters from all available networks.',
            commands: ['AT+COPS'],
        },
        'PLMN FORMAT': {
            value: plmnFormat ?? 'Unknown',
            description:
                'PLMN format (Public Land Mobile Network format) is a setting that determines how a mobile device displays the name of the network it is connected to. It can be set to one of three formats: long alphanumeric, short alphanumeric, or numeric. In long alphanumeric format, the device displays the full name of the network. In short alphanumeric format, the device displays the abbreviated name of the network. In numeric format, the device displays the network’s MCC and MNC codes.',
            commands: ['AT+COPS'],
        },
        // TODO: Need to look into how to display available PLMNS
        // 'AVAILABLE PLMNS': {
        //     value: availablePlmns ?? 'Unknown',
        //     commands: ['AT+COPS'],
        // },
        'PHYSICAL CELL ID': {
            value: physicalCellID ?? 'Unknown',
            description:
                'The Physical Cell ID (PCI) is a unique identifier assigned to the specific physical cell within the base station that the mobile device is connected to. Each base station typically contains multiple physical cells, and the PCI is used to distinguish between them.',
            commands: ['AT%CONEVAL'],
        },
        'CURRENT BAND': {
            value: band ?? 'Unknown',
            description:
                'The band, or current band, refers to the specific frequency range within the electromagnetic spectrum that a mobile device is using to communicate with the cellular network. Knowing the current band can help a user ensure that their device is operating on the appropriate network for their location and service provider.',
            commands: ['AT%XCBAND', 'AT%CONEVAL'],
        },
        'COVERAGE ENHANCEMENT LEVEL': {
            value: conevalCoverageEnhancementLevel ?? 'Unknown',
            description:
                'Coverage Enhancement Level (CEL), indicates the level of Coverage Enhancement (CE) that the modem is currently configured for. Coverage Enhancement is a feature of the LTE cellular network that can improve the signal strength and data transfer rates for devices operating in areas with weak signal coverage.',
            commands: ['AT%CONEVAL'],
        },
        'CONEVAL TX POWER': {
            value: conevalTXPower ?? 'Unknown',
            description: 'The transmit power used by the User Equipment (UE).',
            commands: ['AT%CONEVAL'],
        },
        'CONEVAL TX REPETITIONS': {
            value: conevalTXRepetitions ?? 'Unknown',
            description:
                'The number of times the transmit procedure was repeated.',
            commands: ['AT%CONEVAL'],
        },
        'CONEVAL RX REPETITIONS': {
            value: conevalRXRepetitions ?? 'Unknown',
            description:
                'The number of times the receive procedure was repeated.',
            commands: ['AT%CONEVAL'],
        },
        'CONEVAL DL PATH LOSS': {
            value: conevalDLPathLoss ?? 'Unknown',
            description:
                'The downlink path loss, which is a measure of the attenuation of the signal as it travels from the serving cell to the device.',
            commands: ['AT%CONEVAL'],
        },
    };
    return (
        <DashboardCard
            key="dashboard-LTE-card"
            title="LTE Network"
            iconName="mdi-access-point-network"
            fields={fields}
        />
    );
};

const parseRRCState = (rrcState: number | undefined) => {
    if (rrcState === undefined) return 'Unknown';
    if (rrcState === 0) return 'RRC IDLE';
    if (rrcState === 1) return 'RRC CONNECTED';

    return '' as never;
};

const parseModeFromAcT = (AcTState: AcTState) => {
    if (AcTState === 0) return 'NOT CONNECTED';
    if (AcTState === 4 || AcTState === 7) {
        return 'LTE-M';
    }
    if (AcTState === 5 || AcTState === 9) {
        return 'NB-IoT';
    }

    return null as never;
};

const parseMCC = (mcc: string | undefined, mccCode: number | undefined) => {
    let result = '';
    if (mccCode !== undefined) {
        result += `${mccCode}`;
    }
    if (mcc !== undefined) {
        result += ` ${mcc}`;
    }
    if (result === '') return 'Unknown';
    return result.trim();
};

const parseNotificationStatus = (
    notification:
        | NetworkStatusNotifications
        | SignalingConnectionStatusNotifications
        | (0 | 1)
) => {
    if (notification != null) {
        if (notification === 0) return 'Unsubscribed';

        return `Subscribed with value: ${notification}`;
    }

    return 'Unknown';
};
