/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventAction from '../../app/usageDataActions';

export const EVENT_TYPES = ['AT', 'RRC', 'NAS', 'IP'] as const;
export type eventType = (typeof EVENT_TYPES)[number];
export const EventColours = {
    AT: {
        light: '#C8E6C9',
        dark: '#1B5E20',
    },
    RRC: {
        light: '#FFCDD2',
        dark: '#B71C1C',
    },
    NAS: {
        light: '#FFE0B2',
        dark: '#E65100',
    },
    IP: {
        light: '#C5CAE9',
        dark: '#1A237E',
    },
} as { [K in eventType]: { light: string; dark: string } };
export const ALL_TRACE_FORMATS = ['raw', 'pcap', 'live'] as const;
export type TraceFormat = (typeof ALL_TRACE_FORMATS)[number];

export const sinkEvent = (format: TraceFormat) =>
    ({
        raw: EventAction.RAW_TRACE,
        pcap: EventAction.PCAP_TRACE,
        live: EventAction.LIVE_TRACE,
    })[format] ?? EventAction.UNKNOWN_TRACE;

export const hasProgress = (format: TraceFormat) => format !== 'live';

export type SourceFormat =
    | {
          type: 'file';
          path: string;
      }
    | {
          type: 'device';
          port: string;
          startTime: Date;
          autoDetectedManualDbFile?: string;
      };
