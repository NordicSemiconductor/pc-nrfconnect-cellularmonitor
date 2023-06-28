/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { recommendedAT } from '../../src/features/tracingEvents/at/recommeneded';

export type Documentation = {
    [key: string]: {
        [key: string]: {
            title?: string;
            description?: string;
            commands: readonly (keyof typeof recommendedAT)[];
        };
    };
};

export const documentation: Documentation = {
    'LTE Network': {
        ACT: {
            title: 'Access Technology (AcT)',
            description:
                "The current state of a mobile device's cellular network connection, such as LTE-M or NB-IoT.",
            commands: ['AT+CEREG', 'AT%XMONITOR', 'AT+CEDRXRDP'] as const,
        },
        'ACT STATE': {
            title: 'Access Technology State',
            description:
                "Indicates the current state of a mobile device's cellular network connection.",
            commands: ['AT+CEDRXRDP'] as const,
        },
        RRC: {
            title: 'Radio Resource Control State (RRC)',
            description:
                "The state of the radio resources being used by a mobile device's cellular network connection, such as active or idle state.",
            commands: ['AT%CONEVAL', 'AT+CSCON'] as const,
        },
        'NETWORK TYPE': {
            description:
                "Similar to AcT (Access Technology) State, derived from Internet Protocol (IP) rather than AT 'commands'.",
            commands: [] as const,
        },
        OPERATOR: {
            description:
                'The name of the operator whose network the mobile device is currently registered to. Network provision of operator name is not guaranteed.',
            commands: ['AT%XMONITOR'] as const,
        },
        MNC: {
            title: 'Mobile Network Code (MNC)',
            description:
                'A 2- or 3-digit code identifying the telecommunications network, used together with the MCC to uniquely identify a public land mobile network. It is defined in ITU-T Recommendation E.212.',
            commands: [] as const,
        },
        MCC: {
            title: 'Mobile Country Code (MCC)',
            description:
                'A unique 3-digit code, identifying the country of the mobile network to which the mobile device is connected. MCC is used together with the MNC to uniquely identify a public land mobile network. It is defined in ITU-T Recommendation E.212.',
            commands: [] as const,
        },
        EARFCN: {
            title: 'E-UTRA Absolute Radio Frequency Channel Number (EARFCN)',
            description:
                'An LTE carrier channel number for unique identification of LTE band and carrier frequency.',
            commands: ['AT%CONEVAL'] as const,
        },
        RSRP: {
            title: 'Reference Signal Received Power (RSRP)',
            description:
                'The average power level received from a single reference signal in an LTE network.',
            commands: ['AT%CESQ', 'AT%CONEVAL'] as const,
        },
        RSRQ: {
            title: 'Reference Signal Received Quality (RSRQ)',
            description:
                'The quality of a single reference signal received in an LTE network and calculated from RSRP.',
            commands: ['AT%CESQ', 'AT%CONEVAL'] as const,
        },
        SNR: {
            title: 'Signal-to-Noise Ratio (SNR)',
            description:
                'A measure of the quality of the cellular signal received by the mobile device. It represents the ratio of the signal power to the noise power in the received signal. A higher SNR value indicates a better-quality signal, while a lower value indicates a weaker or noisier signal.',
            commands: ['AT%CESQ', 'AT%CONEVAL'] as const,
        },
        'NETWORK STATUS NOTIFICATIONS': {
            description:
                'The subscription status for unsolicited network status notifications. Possible values are 0 (disabled), 1 (enabled), 2 (enabled with location information), 3 (same as 2, with cause and reject type), 4 (same as 2, with PSM values), 5 (same as 3, with PSM values).',
            commands: ['AT+CEREG'] as const,
        },
        'SIGNALING CONNECTING STATUS NOTIFICATIONS': {
            description:
                'The +CSCON command subscribes and configures unsolicited result code notifications',
            commands: ['AT+CSCON'] as const,
        },
        'ACTIVITY STATUS': {
            description: `The current state of a mobile device's radio interface. This command returns one of the following values:
                0: Not registered. UE is not currently searching for an operator to register to.
                1:  Registered, home network.
                2: Not registered, but UE is currently trying to attach or searching an operator to
register to.
                3: Registration denied.
                4: Unknown  (for example, out of E-UTRAN coverage).
                5: Registered, roaming.
                90: Not registered due to UICC failure.
        `,
            commands: ['AT+CEREG'] as const,
        },
        'EPS NETWORK REGISTRATION STATUS': {
            description:
                'Indicates whether a mobile device is registered with a cellular network, and to which network. This can be useful to check that the device can communicate with other devices and services over the network, and for troubleshooting connection issues.',
            commands: [] as const,
        },
        'NETWORK TIME NOTIFICATIONS': {
            commands: ['AT%XTIME'] as const,
        },
        'LOCAL TIME ZONE': {
            description:
                'The Nordic-proprietary %XTIME command subscribes unsolicited network time notifications.',
            commands: ['AT%XTIME'] as const,
        },
        'UNIVERSAL TIME': {
            description:
                'The Nordic-proprietary %XTIME command subscribes unsolicited network time notifications.',
            commands: ['AT%XTIME'] as const,
        },
        'DAYLIGHT SAVING TIME': {
            description:
                'The Nordic-proprietary %XTIME command subscribes unsolicited network time notifications.',
            commands: ['AT%XTIME'] as const,
        },
        'CONNECTION EVALUATION RESULT': {
            description: `Possible result values are:
                    0: Connection pre-evaluation successful.
                    1: No Cell Available.
                    2: UICC not available.
                    3: Only barred cells available.
                    4: Busy (for example, GNSS activity).
                    5: Aborted because of higher priority operation.
                    6: Not registered.
                    7: Unspecified.
            `,
            commands: ['AT%CONEVAL'] as const,
        },
        'ENERGY ESTIMATE': {
            description:
                'Indicates the overall quality of the received signal, to assess its suitability for data transmission. In general, a higher value indicates a stronger and more reliable signal. However, the interpretation of the Energy Estimate value depends on the specific use case and the requirements of the application.',
            commands: ['AT%CONEVAL'] as const,
        },
        'CELL ID': {
            description:
                'A unique identifier assigned to the cellular base station currently serving the mobile device. It can be useful for location tracking and network optimization.',
            commands: ['AT%CONEVAL'] as const,
        },
        PLMN: {
            title: 'Public Land Mobile Network (PLMN)',
            description:
                'The name of the cellular network that the device is connected to. See also PLMN format and mode.',
            commands: ['AT+COPS', 'AT%CONEVAL'] as const,
        },
        'PLMN MODE': {
            title: 'Public Land Mobile Network Mode (PLMN mode)',
            description:
                'Determines how a mobile device selects and connects to a cellular network. It can be set to one of three modes: Automatic (the device automatically selects and connects to the best available network based on factors such as signal strength), Manual (the device only connects to a network that has been manually selected by the user), or deregister (the device disconnects from the current network and deregisters from all available networks).',
            commands: ['AT+COPS'] as const,
        },
        'PLMN FORMAT': {
            title: 'Public Land Mobile Network Format (PLMN format)',
            description: `Determines how a mobile device displays the name of the connected network. It can be set to one of three formats:

                    Long alphanumeric: the device displays the full name of the network.

                    Short alphanumeric: the device displays the abbreviated name of the network.

                    Numeric: the device displays the network's MCC and MNC codes.
            `,
            commands: ['AT+COPS'] as const,
        },
        'PHYSICAL CELL ID': {
            title: 'PHYSICAL CELL ID (PCI)',
            description:
                'A unique identifier for the specific physical cell within the base station to which the mobile device is connected.',
            commands: ['AT%CONEVAL'] as const,
        },
        'CURRENT BAND': {
            description:
                'The frequency range that a mobile device uses to communicate with the cellular network. Knowing the current band can help ensure that the device is operating on the appropriate network for its location and service provider.',
            commands: ['AT%XCBAND', 'AT%CONEVAL'] as const,
        },
        'COVERAGE ENHANCEMENT LEVEL': {
            title: 'COVERAGE ENHANCEMENT LEVEL (CEL)',
            description:
                'Indicates the level of Coverage Enhancement (CE) for which the modem is configured. This can help to improve the signal strength and data transfer rates for devices operating in areas with weak signal coverage.',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL TX POWER': {
            title: 'CONEVAL Transmit power',
            description: 'The transmit power used by the mobile device.',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL TX REPETITIONS': {
            title: 'CONEVAL Transmit Repetitions',
            description:
                'The number of times the transmit procedure was repeated.',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL RX REPETITIONS': {
            title: 'CONEVAL Receive Repetitions',
            description:
                'The number of times the receive procedure was repeated.',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL DL PATH LOSS': {
            title: 'CONEVAL Downlink Path Loss',
            description:
                'The downlink path loss, which is a measure of the attenuation of the signal as it travels from the serving cell to the device.',
            commands: ['AT%CONEVAL'] as const,
        },
    },
    Device: {
        IMEI: {
            title: 'International Mobile Equipment Identity (IMEI)',
            description:
                "A unique 15-digit code that identifies a mobile device. It can be used to track the device, block it from being used on a cellular network if it's been reported as lost or stolen, and for other purposes such as device authentication.",
            commands: ['AT+CGSN'] as const,
        },
        'MODEM FIRMWARE': {
            description:
                "The current modem firmware version. The trace database used by Cellular Monitor depends on the modem firmware version. If your trace has no AT activity, open Serial Terminal and run the command 'AT+CGMR'. Use the response to select the correct trace database.",
            commands: ['AT+CGMR'] as const,
        },
        'HARDWARE VERSION': {
            description: 'The hardware revision of the mobile device.',
            commands: ['AT%HWVERSION'] as const,
        },
        'MODEM UUID': {
            title: 'Modem Universally Unique Identifier (UUID)',
            description: `A unique identifier generated when modem firmware is built. It can be used to track the specific version of a device's modem firmware.`,
            commands: ['AT%XMODEMUUID'] as const,
        },
        'CURRENT BAND': {
            description:
                'The frequency range that a mobile device uses to communicate with the cellular network. Knowing the current band can help ensure that the device is operating on the appropriate network for its location and service provider.',
            commands: ['AT%XCBAND', 'AT%CONEVAL'] as const,
        },
        'SUPPORTED BANDS': {
            description:
                'A list of the frequency bands that the mobile device can use for cellular communication. This can be useful for determining which networks and service providers are compatible with the device, as well as for troubleshooting connection issues related to network compatibility.',
            commands: ['AT%XCBAND'] as const,
        },
        'DATA PROFILE': {
            description:
                'Provides information on the application use case to the modem for power consumption optimization. The command is Nordic-proprietary, see the documentation at the following link for more information.',
            commands: ['AT%XDATAPRFL'] as const,
        },
        MANUFACTURER: {
            description:
                'Identification of the manufacturer of the modem on the mobile device.',
            commands: ['AT+CGMI'] as const,
        },
        'PREFERRED BEARER': {
            description: `The modem's preferred network type. It can be set to LTE-M or NB-IoT, see the documentation at the following link for more information.`,
            commands: ['AT%XSYSTEMMODE'] as const,
        },
        'SUPPORTED BEARERS': {
            description:
                'List of supported bearers. Possible bearers are LTE-M, NB-IoT and GNSS.',
            commands: ['AT%XSYSTEMMODE'] as const,
        },
        'FUNCTIONAL MODE': {
            description:
                'The functional mode of the modem, such as: Power off, Normal, Offline/Flight mode.',
            commands: ['AT+CFUN'] as const,
        },
        'TRACE STATE OPERATION': {
            description:
                "The modem's trace state operation - it is used together with Trace State Identifier.  The recommended values when using Cellular Monitor are:  state operation: 1, state identifier: 2. AT%XMODEMTRACE=1,2",
            commands: ['AT%XMODEMTRACE'] as const,
        },
        'TRACE STATE SET ID': {
            title: 'Trace State Identifier',
            description:
                "The modem's trace state identifier - it is used together with Trace State Operation. The recommended values when using Cellular Monitor are: state operation: 1, state identifier: 2. AT%XMODEMTRACE=1,2",
            commands: ['AT%XMODEMTRACE'] as const,
        },
        'LTE-M TX REDUCTION': {
            title: 'LTE-M Transmission Reduction',
            description:
                'If set before modem activation, this configures an extra reduction of 0.5 or 1 dB to the maximum transmission power on LTE-M. The command is Nordic-proprietary, see the documentation at the following link for more information.',
            commands: ['AT%XEMPR'] as const,
        },
        'NB-IOT TX REDUCTION': {
            title: 'NB-IOT Transmission Reduction',
            description:
                'If set before modem activation this configures an extra reduction of 0.5 or 1 dB to the maximum transmission power on NB-IOT. The command is Nordic-proprietary, see the documentation at the following link for more information.',
            commands: ['AT%XEMPR'] as const,
        },
        'ME OVERHEATED': {
            title: 'Mobile Equipment (ME) Overheated',
            description: 'ME is overheated and therefore modem is deactivated',
            commands: ['AT+CGEV', 'AT%MDMEV'] as const,
        },
        'ME BATTERY LOW': {
            title: 'Mobile Equipment (ME) Battery Low',
            description: 'ME battery is low and modem is deactivated',
            commands: ['AT+CGEV', 'AT%MDMEV'] as const,
        },
        'SEARCH STATUS 1': {
            description: `SEARCH STATUS 1 indicates light search performed. This event gives the application a chance to
            stop the modem from using more power on searching networks from possibly weaker radio condition.
            Before sending this event, the modem searches the cells based on previous cell history, measures the
            radio conditions, and makes assumptions on where networks might be deployed. This event means that
            the modem has not found a network that it could select based on the 3GPP network selection rules
            from those locations. It does not mean that there are no networks to be found in the area. The modem
            continues more thorough searches automatically after sending this status. The modem can be deactivated,
            for example, with +CFUN=4, to stop it from using more power on the search.`,
            commands: ['AT%MDMEV'] as const,
        },
        'SEARCH STATUS 2': {
            description: `SEARCH STATUS 2 indicates search performed. The modem has found a network that it can select
            according to the 3GPP network selection rules or all frequencies have been scanned and a suitable cell
            has not been found. In the latter case, the modem enters normal limited service state functionality and
            performs scans for service periodically.`,
            commands: ['AT%MDMEV'] as const,
        },
        'RESET LOOP': {
            description: `RESET LOOP indicates that the modem restricts Attach attempts for the next 30 minutes. The timer
            does not run when the modem has no power or while it stays in the reset loop. The modem counts all the resets where the modem is not gracefully deinitialized with +CFUN=0.

            Reset Loop is activated if:
            For mfw v1.3.0: more than five resets
            For mfw >= v1.3.1: more than seven resets
            `,
            commands: ['AT%MDMEV'] as const,
        },
    },
    Sim: {
        'UICC STATUS': {
            title: 'Universal Integrated Circuit Card (UICC) Status',
            description:
                'Status of the UICC, a new generation Subscriber Identity Module (SIM) used in mobile device for ensuring the integrity and security of personal data.',
            commands: ['AT%XSIM'] as const,
        },
        IMSI: {
            title: 'International Mobile Subscriber Identity (IMSI)',
            description:
                'A unique code, usually 15 digits, used for the identification of a mobile subscriber and consisting of MCC, MNC, and MSIN (Mobile Subscription Identification Number).',
            commands: ['AT+CIMI'] as const,
        },
        MANUFACTURER: {
            commands: ['AT+CGMI'] as const,
        },
        ICCID: {
            title: 'Integrated Circuit Card Identifier (ICCID)',
            description: 'The unique serial number of a SIM/UICC card.',
            commands: ['AT%XICCID'] as const,
        },
        PIN: {
            title: 'Personal Identification Number (PIN)',
            description:
                'An optional security feature on the SIM. If enabled, a PIN is a numeric code which must be entered each time a mobile device is started.',
            commands: ['AT+CPIN'] as const,
        },
        'PIN RETRIES': {
            title: 'Personal Identification Number (PIN) Retries',
            description:
                'The number of remaining PIN retries. A SIM is disabled when the number of PIN retries is exceeded and a PUK is then required to unlock it.',
            commands: ['AT+CPINR'] as const,
        },
        'PUK RETRIES': {
            title: 'Personal Unblocking Key (PUK) Retries',
            description:
                'The number of remaining (PUK) Retries. A digit sequence required in to unlock a SIM that is disabled when the remaining Personal Identification Number (PIN) retries is exceeded.',
            commands: ['AT+CPINR'] as const,
        },
        'PIN2 RETRIES': {
            title: 'Personal Identification Number (PIN) 2 Retries',
            description:
                'The number of remaining PIN2 retries. A SIM is disabled when the number of PIN retries is exceeded and a PUK is then required to unlock it.',
            commands: ['AT+CPINR'] as const,
        },
        'PUK2 RETRIES': {
            title: 'Personal Unblocking Key (PUK) 2 Retries',
            description:
                'The number of remaining PUK2 Retries. A digit sequence required in to unlock a SIM that is disabled when the remaining Personal Identification Number (PIN) retries is exceeded.',
            commands: ['AT+CPINR'] as const,
        },
    },
    'Power Saving Features': {
        'REQUESTED ACTIVE TIMER': {
            title: 'Requested Active Timer (T3324)',
            description:
                'The T3324 timer that the modem has requested from the network. Network provision of the timer is not guaranteed.',
            commands: ['AT+CPSMS'] as const,
        },
        'PROVIDED ACTIVE TIMER': {
            title: 'Provided Active Timer (T3324)',
            description: 'The T3324 timer that is provided by the network.',
            commands: ['AT+CEREG', 'AT%XMONITOR'] as const,
        },
        'REQUESTED PERIODIC TAU': {
            title: 'Requested Periodic TAU (T3412 EXTENDED)',
            description:
                'The T3412 timer that the modem has requested from the network. Network provision of the timer is not guaranteed.',
            commands: ['AT+CPSMS'] as const,
        },
        'PROVIDED PERIODIC TAU': {
            title: 'Provided Periodic TAU (T3412 EXTENDED)',
            description:
                'The T3412 timer that is provided by the network, and should be preferred over the Legacy T3412 value.',
            commands: ['AT+CEREG', 'AT%XMONITOR'] as const,
        },
        'LEGACY PROVIDED PERIODIC TAU': {
            title: 'Legacy Provided Periodic TAU (T3412)',
            description:
                'The legacy T3412 timer that is provided by the network.',
            commands: ['AT+CEREG', 'AT%XMONITOR'] as const,
        },
        'PROVIDED POWER SAVING MODE STATE': {
            title: 'Provided Power Saving Mode State',
            commands: ['AT+CEREG', 'AT%XMONITOR'] as const,
        },
        'TAU TRIGGERED': {
            title: 'Tracking Area Update Triggered',
            description: `Possible values:
	                0: User Equipment(UE) is registered on the evaluated cell.Therefore, Tracking Area Update(TAU) is not needed before sending user data.
	                1: UE is not registered on the evaluated cell.Therefore, the TAU procedure is initiated before sending user data.
	                255: Not known.The command is Nordic- proprietary, see the documentation at the following link for more information.`,
            commands: ['AT%CONEVAL'] as const,
        },
        'LTE-M REQUESTED EDRX': {
            title: 'Requested extended Discontinuous Reception (eDRX) for LTE-M',
            description:
                'This is requested by the mobile device during its cellular network registration. The value indicates the desired eDRX cycle length that the device would like to use to conserve power, while maintaining an acceptable level of network connectivity.',
            commands: ['AT+CEDRXRDP'] as const,
        },
        'LTE-M NW PROVIDED EDRX': {
            title: 'Network provided extended Discontinuous Reception (eDRX)',
            description:
                'This is provided by the cellular network to a mobile device during its registration process. The value indicates the suggested eDRX cycle length that the device should use to conserve power, while maintaining a reasonable level of network connectivity.',
            commands: ['AT+CEDRXRDP'] as const,
        },
        'LTE-M PAGING TIME WINDOW': {
            description:
                'The period of time during which the mobile device attempts to receive a paging message.',
            commands: ['AT+CEDRXRDP'] as const,
        },
        'NB-IOT REQUESTED EDRX': {
            title: 'Requested extended Discontinuous Reception (eDRX) for NB-IoT',
            description:
                'This is requested by the mobile device during its cellular network registration. The value indicates the desired eDRX cycle length that the device would like to use to conserve power, while maintaining an acceptable level of network connectivity.',
            commands: ['AT+CEDRXRDP'] as const,
        },
        'NB-IOT NW PROVIDED EDRX': {
            title: 'Network provided extended Discontinuous Reception (eDRX)',
            description:
                'This is provided by the cellular network to a mobile device during its registration process. The value indicates the suggested eDRX cycle length that the device should use to conserve power, while maintaining a reasonable level of network connectivity.',
            commands: ['AT+CEDRXRDP'] as const,
        },
        'NB-IOT PAGING TIME WINDOW': {
            description:
                'The period of time during which the mobile device attempts to receive a paging message.',
            commands: ['AT+CEDRXRDP'] as const,
        },
    },
    'Connectivity Statistics': {
        'COLLECTING DATA': {
            description: `The Nordic-proprietary %XCONNSTAT command starts and stops the collecting of connectivity statistics.
                0: Stop.
                1: Start.
            `,
            commands: ['AT%XCONNSTAT'] as const,
        },
        'SUCCESSFUL SMS TX': {
            title: 'Successful SMS Transmitted',
            description:
                'The total number of SMSs successfully transmitted during the collection period.',
            commands: ['AT%XCONNSTAT'] as const,
        },
        'SUCCESSFUL SMS RX': {
            title: 'Successful SMS Received',
            description:
                'The total number of SMSs successfully received during the collection period.',
            commands: ['AT%XCONNSTAT'] as const,
        },
        'DATA TRANSMITTED': {
            description:
                'The total amount of data (in kilobytes) transmitted during the collection period.',
            commands: ['AT%XCONNSTAT'] as const,
        },
        'DATA RECIEVED': {
            description:
                'The total amount of data (in kilobytes) received during the collection period.',
            commands: ['AT%XCONNSTAT'] as const,
        },
        'MAX PACKET SIZE TX OR RX': {
            title: 'Maximum Packet Size Transmitted or Received',
            description:
                'The maximum packet size (in bytes) used during the collection period.',
            commands: ['AT%XCONNSTAT'] as const,
        },
        'AVERAGE PACKET SIZE': {
            description:
                'The average packet size (in bytes) used during the collection period',
            commands: ['AT%XCONNSTAT'] as const,
        },
    },
    'Packet Domain Network': {
        'ACCESS POINT NAME': {
            description:
                'The name of the gateway between the mobile network and the data network.',
            commands: [] as const,
        },
        'PDP TYPE': {
            title: 'Packet Data Protocol Type',
            description: `The packet transfer protocol used, possible values:
			        IP: Internet Protocol.
                    IPV6: Internet Protocol version 6.
                    IPV4V6: Virtual type of dual IP stack.
                    Non-IP: Transfer of non-IP data to external packet data network.`,
            commands: ['AT+CGDCONT'] as const,
        },
        'PDP TYPE RAW': {
            commands: [] as const,
        },
        'IPV4 ADDRESS': {
            description: 'The IPV4 address assigned to the mobile device.',
            commands: ['AT+CGDCONT'] as const,
        },
        'IPV6 ADDRESS': {
            commands: [] as const,
        },
        INFO: {
            commands: [] as const,
        },
        CONNECTION: {
            commands: [] as const,
        },
        'CONTEXT ID': {
            description:
                'Specifies a particular Packet Data Protocol (PDP) Context definition. The parameter is local to the device and is used in other PDP context related commands.',
            commands: ['AT+CGDCONT'] as const,
        },
    },
};
