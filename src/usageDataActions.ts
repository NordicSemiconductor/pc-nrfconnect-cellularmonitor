/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

enum EventAction {
    RAW_TRACE = 'Starting Raw trace',
    PCAP_TRACE = 'Starting Pcap trace',
    LIVE_TRACE = 'Starting Live trace',
    UNKNOWN_TRACE = 'Unknown trace',
    CONVERT_TRACE = 'Convert trace',
    STOP_TRACE = 'Stopping trace',
    OPEN_IN_WIRESHARK = 'Open in Wireshark',
    SET_TRACE_DB_MANUALLY = 'Set trace db manually',
    OPEN_FILE_DIRECTORY = 'Open file directory',
}

export default EventAction;
