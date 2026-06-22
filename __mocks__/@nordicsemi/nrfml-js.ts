/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable max-classes-per-file */
export class TraceTaskBuilder {
    withDataSource() {
        return this;
    }

    withModemDecoder() {
        return this;
    }

    withProgressCb() {}
    withRawSink() {}
    withPcapSink() {}
    withWiresharkSink() {}
    withUserDataCb() {}

    spawn() {
        return { abortHandle: jest.fn(() => ({ cancel: jest.fn() })) };
    }
}

export const waitForTask = jest.fn(() => Promise.resolve());

export class DataSource {
    static fromSerialport() {}
    static fromFile() {}
}

export class SerialPortBuilder {}

export class ModemTraceDecoderOpts {}

export class RawSinkOpts {}

export class PcapSinkOpts {
    withApplicationName() {
        return this;
    }

    withOsName() {
        return this;
    }

    withOutputPath() {
        return this;
    }

    withHwName() {}
}

export class WiresharkSinkOpts {
    withWiresharkPath() {
        return this;
    }

    withApplicationName() {
        return this;
    }

    withOsName() {
        return this;
    }

    withHwName() {}
}
