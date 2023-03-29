/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventAction from '../../usageDataActions';

export const EVENT_TYPES = ['IP', 'AT', 'RRC', 'NAS'] as const;
export type eventType = typeof EVENT_TYPES[number];
export const ALL_TRACE_FORMATS = ['raw', 'pcap', 'live', 'tshark'] as const;
export type TraceFormat = typeof ALL_TRACE_FORMATS[number];

export const sinkEvent = (format: TraceFormat) =>
    ({
        raw: EventAction.RAW_TRACE,
        pcap: EventAction.PCAP_TRACE,
        live: EventAction.LIVE_TRACE,
        tshark: EventAction.TSHARK_TRACE,
    }[format] ?? EventAction.UNKNOWN_TRACE);

export const hasProgress = (format: TraceFormat) =>
    format !== 'live' && format !== 'tshark';

export type SourceFormat =
    | {
          type: 'file';
          path: string;
      }
    | {
          type: 'device';
          port: string;
          startTime: Date;
      };
