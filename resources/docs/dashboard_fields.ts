/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const documentation = {
    LTENetwork: {
        AcT: {
            description:
                "AcT (Access Technology) refers to the current operational state of a mobile device's cellular network connection. It indicates which type of cellular technology (e.g. LTE-M or NB-IoT) the device is currently using to connect to the network.",
            commands: ['AT+CEREG', 'AT%XMONITOR', 'AT+CEDRXRDP'] as const,
        },
        'ACT STATE': {
            description:
                "The Access Technology (AcT) state indicates the current operational state of a mobile device's cellular network connection. It indicates which type of cellular technology (e.g. LTE-M or NB-IoT) the device is currently using to connect to the network.",
            commands: ['AT+CEDRXRDP'] as const,
        },
        'RRC STATE': {
            description:
                "RRC (Radio Resource Control) State refers to the state of the radio resources being used by a mobile device's cellular network connection. It indicates whether the device is in an active or idle state.",
            commands: ['AT%CONEVAL', 'AT+CSCON'] as const,
        },
        'NETWORK TYPE': {
            description:
                "Same as AcT (Access Technology) State, but derived from IP packet, in contrast to the fields above, which are derived from AT 'commands'.",
            commands: [] as const,
        },
        MNC: {
            description:
                'Mobile Network Code (MNC) is a code identifying the telecommunications network. The code is defined by ITU-T Recommendation E.212, consists of two or three decimal digits, and is used together with the Mobile Country Code (MCC)',
            commands: [] as const,
        },
        MCC: {
            description:
                'Mobile Country Code (MCC) is a unique three-digit part of an IMSI code identifying the country of domicile of the mobile subscriber. MCC is used together with the Mobile Network Code (MNC).',
            commands: [] as const,
        },
        EARFCN: {
            description:
                'E-UTRA Absolute Radio Frequency Channel Number (EARFCN), is an LTE carrier channel number for unique identification of LTE band and carrier frequency.',
            commands: ['AT%CONEVAL'] as const,
        },
        RSRP: {
            description:
                'Reference Signal Received Power (RSRP), is the average power level received from a single reference signal in an LTE (Long-Term Evolution) network.',
            commands: ['AT%CESQ'] as const,
        },
        RSRQ: {
            description:
                'Reference Signal Received Quality (RSRQ), is the quality of a single reference signal received in an LTE (Long-Term Evolution) network and calculated from RSRP.',
            commands: ['AT%CESQ'] as const,
        },
        'SIGNAL QUALITY (RSRP)': {
            description:
                'Reference Signal Received Power (RSRP), is the average power level received from a single reference signal in an LTE (Long-Term Evolution) network.',
            commands: ['AT%CONEVAL'] as const,
        },
        'SIGNAL QUALITY (RSRQ)': {
            description:
                'Reference Signal Received Quality (RSRQ), is the quality of a single reference signal received in an LTE (Long-Term Evolution) network and calculated from RSRP.',
            commands: ['AT%CONEVAL'] as const,
        },
        'SIGNAL QUALITY (SNR)': {
            description:
                'Signal-to-Noise Ratio (SNR), returned by the AT command %CONEVAL, is a measure of the quality of the cellular signal received by the mobile device. It represents the ratio of the signal power to the noise power present in the received signal. A higher SNR value indicates a better-quality signal with less noise, while a lower value indicates a weaker or noisier signal.',
            commands: ['AT%CONEVAL'] as const,
        },
        'NETWORK STATUS NOTIFICATIONS': {
            description:
                'The +CEREG command subscribes unsolicited network status notifications. Possible values are 0 (disabled), 1 (enabled), 2 (enabled with location information), 3 (same as 2, but with cause and reject type), 4 (same as 2, but with PSM values), 5 (same as 3, but with PSM values).',
            commands: ['AT+CEREG'] as const,
        },
        'SIGNALING CONNECTING STATUS NOTIFICATIONS': {
            description:
                'The +CSCON command subscribes and configures unsolicited result code notifications',
            commands: ['AT+CSCON'] as const,
        },
        'ACTIVITY STATUS': {
            description: `The AT command +CPAS (Device Activity Status) is used to query the current state of a mobile device's radio interface. This command returns a value that indicates whether the device is currently in one of the following states:0: Device is powered off
                1: Device is powered on and is not currently searching for a network
                2: Device is currently searching for a network to register with
                3: Device is currently registering with a network
                4: Device is registered with a network and is currently idle
                5: Device is currently engaged in a data call or voice call
                6: Device is in a reserved state
        `,
            commands: ['AT+CPAS'] as const,
        },
        'EPS NETWORK REGISTRATION STATUS': {
            description:
                'The EPS Network Registration Status field indicates whether a mobile device is currently registered with a cellular network, and if so, which network it is registered with. This information can be useful for ensuring that the device is able to communicate with other devices and services over the network, and for troubleshooting connection issues.',
            commands: [] as const,
        },
        'REQUESTED EDRX': {
            description:
                'The requested eDRX value is a value that is requested by the mobile device during its registration process with the cellular network. This value indicates the desired eDRX (extended Discontinuous Reception) cycle length that the device would like to use to conserve power while maintaining an acceptable level of network connectivity.',
            commands: ['AT+CEDRXRDP'] as const,
        },
        'NW PROVIDED EDRX': {
            description:
                'The NW Provided eDRX value is a value that is provided by the cellular network to a mobile device during its registration process. This value indicates the suggested eDRX (extended Discontinuous Reception) cycle length that the device should use to conserve power while maintaining a reasonable level of network connectivity.',
            commands: ['AT+CEDRXRDP'] as const,
        },
        'PAGING TIME WINDOW': {
            description:
                'Paging Time Window (PTW), is the period of time during which the User Equipment (UE) attempts to receive a paging message.',
            commands: ['AT+CEDRXRDP'] as const,
        },
        'NETWORK TIME NOTIFICATIONS': {
            commands: ['AT%XTIME'] as const,
        },
        'LOCAL TIME ZONE': {
            commands: ['AT%XTIME'] as const,
        },
        'UNIVERSAL TIME': {
            commands: ['AT%XTIME'] as const,
        },
        'DAYLIGHT SAVING TIME': {
            commands: ['AT%XTIME'] as const,
        },
        'CONNECTION EVALUATION RESULT': {
            description:
                "Possible result values are: 0='Connection pre-evaluation successful', 1='No Cell Available', 2='UICC not available', 3='Only barred cells available', 4='Busy (for example, GNSS activity)', 5='Aborted because of higher priority operation', 6='Not registered', 7='Unspecified'.",
            commands: ['AT%CONEVAL'] as const,
        },
        'ENERGY ESTIMATE': {
            description:
                'Energy Estimate is a useful parameter for estimating the overall quality of the received signal and assessing the suitability of the signal for data transmission. In general, a higher Energy Estimate value indicates a stronger and more reliable signal. However, the interpretation of the Energy Estimate value depends on the specific use case and the requirements of the application.',
            commands: ['AT%CONEVAL'] as const,
        },
        'CELL ID': {
            description:
                'The Cell ID is a unique identifier assigned to the cellular base station that is currently serving the mobile device. It can be used to identify the specific base station that the device is connected to and can be useful for location tracking and network optimization.',
            commands: ['AT%CONEVAL'] as const,
        },
        PLMN: {
            description:
                'PLMN (Public Land Mobile Network) is the name of the network that the device is connected to.',
            commands: ['AT+COPS', 'AT%CONEVAL'] as const,
        },
        'PLMN MODE': {
            description:
                'PLMN mode (Public Land Mobile Network mode) is a setting that determines how a mobile device selects and connects to a cellular network. It can be set to one of three modes: automatic, manual, or deregister. In automatic mode, the device automatically selects and connects to the best available network based on its signal strength and other factors. In manual mode, the device only connects to a network that has been manually selected by the user. In deregister mode, the device disconnects from the current network and deregisters from all available networks.',
            commands: ['AT+COPS'] as const,
        },
        'PLMN FORMAT': {
            description:
                'PLMN format (Public Land Mobile Network format) is a setting that determines how a mobile device displays the name of the network it is connected to. It can be set to one of three formats: long alphanumeric, short alphanumeric, or numeric. In long alphanumeric format, the device displays the full name of the network. In short alphanumeric format, the device displays the abbreviated name of the network. In numeric format, the device displays the network’s MCC and MNC codes.',
            commands: ['AT+COPS'] as const,
        },
        'PHYSICAL CELL ID': {
            description:
                'The Physical Cell ID (PCI) is a unique identifier for the specific physical cell within the base station to which the mobile device is connected. Each base station typically contains multiple physical cells, and the PCI is used to distinguish between them.',
            commands: ['AT%CONEVAL'] as const,
        },
        'CURRENT BAND': {
            description:
                'The band, or current band, refers to the specific frequency range within the electromagnetic spectrum that a mobile device is using to communicate with the cellular network. Knowing the current band can help a user ensure that their device is operating on the appropriate network for their location and service provider.',
            commands: ['AT%XCBAND', 'AT%CONEVAL'] as const,
        },
        'COVERAGE ENHANCEMENT LEVEL': {
            description:
                'Coverage Enhancement Level (CEL), indicates the level of Coverage Enhancement (CE) that the modem is currently configured for. Coverage Enhancement is a feature of the LTE cellular network that can improve the signal strength and data transfer rates for devices operating in areas with weak signal coverage.',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL TX POWER': {
            description: 'The transmit power used by the User Equipment (UE).',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL TX REPETITIONS': {
            description:
                'The number of times the transmit procedure was repeated.',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL RX REPETITIONS': {
            description:
                'The number of times the receive procedure was repeated.',
            commands: ['AT%CONEVAL'] as const,
        },
        'CONEVAL DL PATH LOSS': {
            description:
                'The downlink path loss, which is a measure of the attenuation of the signal as it travels from the serving cell to the device.',
            commands: ['AT%CONEVAL'] as const,
        },
    },
    Device: {
        IMEI: {
            description:
                "The International Mobile Equipment Identity (IMEI) is a unique 15-digit code that identifies a mobile device. Every device has a unique IMEI, which can be used to track the device, block it from being used on a cellular network if it's been reported as lost or stolen, and for other purposes such as device authentication.",
            commands: ['AT+CGSN'] as const,
        },
        'MODEM FIRMWARE': {
            description:
                "The current modem firmware version. The trace database used by Cellular Monitor depends on the modem firmware version. If your trace has no AT activity, open Serial Terminal and try running the command 'AT+CGMR'. Use the response to select the correct trace database.",
            commands: ['AT+CGMR'] as const,
        },
        'HARDWARE VERSION': {
            description: 'The hardware revision of the User Equipment (UE).',
            commands: ['AT%HWVERSION'] as const,
        },
        'MODEM UUID': {
            description:
                'The Modem UUID is a unique identifier that is generated during the manufacturing of the modem firmware and can be used to track the specific version of the firmware that is running on a device.',
            commands: ['AT%XMODEMUUID'] as const,
        },
        'CURRENT BAND': {
            description:
                'The current band refers to the specific frequency range within the electromagnetic spectrum that a mobile device is using to communicate with the cellular network. Knowing the current band can help ensure that your device is operating on the appropriate network for your location and service provider.',
            commands: ['AT%XCBAND', 'AT%CONEVAL'] as const,
        },
        'SUPPORTED BANDS': {
            description:
                'The Supported Bands returned by the AT command %XCBAND=? is a list of the different frequency bands that the mobile device is capable of using for its cellular communication. This information can be useful for determining which networks and service providers are compatible with the device, as well as for troubleshooting connection issues related to network compatibility.',
            commands: ['AT%XCBAND'] as const,
        },
        'DATA PROFILE': {
            description:
                'A data profile specifies the settings for a cellular data connection, such as the APN (Access Point Name), authentication settings, and other parameters',
            commands: ['AT%XDATAPRFL'] as const,
        },
        MANUFACTURER: {
            description: 'Identification of the manufacturer of the modem.',
            commands: ['AT+CGMI'] as const,
        },
        'PREFERRED BEARER': {
            description:
                'The preferred bearer is the preferred network type for the modem. The preferred bearer can be set to LTE-M or NB-IoT, please read the documentation for more information.',
            commands: ['AT%XSYSTEMMODE'] as const,
        },
        'SUPPORTED BEARERS': {
            description:
                'List of supported bearers. Possible bearers are LTE-M, NB-IoT and GNSS.',
            commands: ['AT%XSYSTEMMODE'] as const,
        },
        'FUNCTIONAL MODE': {
            description:
                'The functional mode of the modem. E.g. Power off, Normal, Offline/Flight mode, etc.',
            commands: ['AT+CFUN'] as const,
        },
        'TRACE STATE OPERATION': {
            description:
                'The Trace State Operation of the modem. The recommended value when using the app is (1,2): AT%XMODEMTRACE=1,2',
            commands: ['AT%XMODEMTRACE'] as const,
        },
        'TRACE STATE SET ID': {
            description:
                'The Trace State Operation of the modem. The recommended value when using the app is (1,2): AT%XMODEMTRACE=1,2',
            commands: ['AT%XMODEMTRACE'] as const,
        },
        'LTE-M TX REDUCTION': {
            description:
                'The Nordic-proprietary %XEMPR command allows you to configure an extra reduction of 0.5 or 1 dB to the maximum transmission power on all or selected supported 3GPP bands separately in the NB-IoT and LTEM modes. %XEMPR should be given before the activation of the modem to be effective',
            commands: ['AT%XEMPR'] as const,
        },
        'NB-IOT TX REDUCTION': {
            description:
                'The Nordic-proprietary %XEMPR command allows to you configure an extra reduction of 0.5 or 1 dB to the maximum transmission power on all or selected supported 3GPP bands separately in the NB-IoT and LTEM modes. %XEMPR should be given before the activation of the modem to be effective',
            commands: ['AT%XEMPR'] as const,
        },
    },
    Sim: {
        IMSI: {
            commands: ['AT+CIMI'] as const,
        },
        OPERATOR: {
            commands: ['AT%XMONITOR'] as const,
        },
        MANUFACTURER: {
            commands: ['AT+CGMI'] as const,
        },
        ICCID: {
            commands: ['AT%XICCID'] as const,
        },
        PIN: {
            commands: ['AT+CPIN'] as const,
        },
        'PIN RETRIES': {
            commands: ['AT+CPINR'] as const,
        },
        'PUK RETRIES': {
            commands: ['AT+CPINR'] as const,
        },
        'PIN2 RETRIES': {
            commands: ['AT+CPINR'] as const,
        },
        'PUK2 RETRIES': {
            commands: ['AT+CPINR'] as const,
        },
    },
    PowerSavingMode: {
        'REQUESTED ACTIVE TIMER(T3324)': {
            commands: ['AT+CPSMS'] as const,
        },
        'GRANTED ACTIVE TIMER(T3324)': {
            commands: ['AT+CEREG', 'AT%XMONITOR'] as const,
        },
        'REQUESTED PERIODIC TAU(T3412 EXTENDED)': {
            commands: ['AT+CPSMS'] as const,
        },
        'GRANTED PERIODIC TAU(T3412 EXTENDED)': {
            commands: ['AT+CEREG', 'AT%XMONITOR'] as const,
        },
        'GRANTED PERIODIC TAU(T3412 / LEGACY)': {
            commands: ['AT+CEREG', 'AT%XMONITOR'] as const,
        },
        'POWER SAVING MODE STATE (GRANTED)': {
            commands: ['AT+CEREG', 'AT%XMONITOR'] as const,
        },
        'TAU TRIGGERED': {
            commands: ['AT%CONEVAL'] as const,
        },
    },
    ConnectivityStatistics: {
        'COLLECTING DATA': {
            commands: ['AT%XCONNSTAT'] as const,
        },
        'SUCCESSFUL SMS TX': {
            commands: ['AT%XCONNSTAT'] as const,
        },
        'SUCCESSFUL SMS RX': {
            commands: ['AT%XCONNSTAT'] as const,
        },
        'DATA TRANSMITTED': {
            commands: ['AT%XCONNSTAT'] as const,
        },
        'DATA RECIEVED': {
            commands: ['AT%XCONNSTAT'] as const,
        },
        'MAX PACKET SIZE TX OR RX': {
            commands: ['AT%XCONNSTAT'] as const,
        },
        'AVERAGE PACKET SIZE': {
            commands: ['AT%XCONNSTAT'] as const,
        },
    },
    'Packet Domain Network': {
        'Access Point Name': {
            commands: [] as const,
        },
        'PDN Type': {
            commands: [] as const,
        },
        'PDN Type Raw': {
            commands: [] as const,
        },
        'IPv4 Address': {
            commands: [] as const,
        },
        'IPv6 Address': {
            commands: [] as const,
        },
        info: {
            commands: [] as const,
        },
        Connection: {
            commands: [] as const,
        },
    },
};
