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
    EXTRACT_POWER_DATA = 'Extract power data',
    STOP_TRACE = 'Stopping trace',
    OPEN_IN_WIRESHARK = 'Open in Wireshark',
    SET_WIRESHARK_PATH = 'Set Wireshark path',
    SET_TRACE_DB_MANUALLY = 'Set trace db manually',
    OPEN_FILE_DIRECTORY = 'Open file directory',
    VISIT_OPP = 'Visit OPP website',
    POWER_ESTIMATION_PANE = 'Open Power Estimation pane',
    PROGRAM_SAMPLE = 'Program sample application',
    OPEN_BUY_DK_DIALOG = 'Open buy DK dialog',
    READ_TRACE_FILE = 'Read trace file',
    OPEN_TRACE_IN_WIRESHARK = 'Open trace in wireshark',
    SELECT_TRACE_DATABASE = 'Select trace database',
    TOGGLE_OPEN_IN_WIRESHARK = 'Toggle open in wireshark',
    TOGGLE_SAVE_TRACE_TO_FILE = 'Toggle save trace to file',
    OPEN_SERIAL_TERMINAL = 'Open serial terminal',
    OPEN_CHART_OPTIONS = 'Open chart options',
    SEND_AT_COMMANDS_MACRO = 'Send AT Commands Macro',
}

export default EventAction;
