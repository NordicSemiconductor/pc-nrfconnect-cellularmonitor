/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

enum EventAction {
    RAW_TRACE = 'Starting Raw trace',
    PCAP_TRACE = 'Starting Pcap trace',
    LIVE_TRACE = 'Starting Live trace',
    OPP_TRACE = 'Getting OPP params',
    UNKNOWN_TRACE = 'Unknown trace',
    CONVERT_TRACE = 'Convert trace',
    EXTRACT_POWER_DATA = 'Extract power data',
    STOP_TRACE = 'Stopping trace',
    OPEN_IN_WIRESHARK = 'Open in Wireshark',
    SET_WIRESHARK_PATH = 'Set Wireshark path',
    SET_TSHARK_PATH = 'Set Tshark path',
    SET_TRACE_DB_MANUALLY = 'Set trace db manually',
    OPEN_FILE_DIRECTORY = 'Open file directory',
    VISIT_OPP = 'Visit OPP website',
    POWER_ESTIMATION_PANE = 'Open Power Estimation pane',
}

export default EventAction;
