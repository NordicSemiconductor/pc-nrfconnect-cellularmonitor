/* Copyright (c) 2015 - 2021, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { logger, usageData } from 'pc-nrfconnect-shared';

import pkgJson from '../../package.json';

export enum EventAction {
    LAUNCH_APP = 'Launch app',
    LAUNCH_SETTINGS_VIEW = 'Launch settings view',
    LAUNCH_ABOUT_VIEW = 'Launch about view',
    REPORT_OS_INFO = 'Report OS info',
    REPORT_ERROR = 'Report error',
}

const eventCategory = pkgJson.name;

let isInited = false;
let eventQueue: { action: EventAction; label: string }[] = [];

/**
 * Initialize Google Analytics to send usage data event
 * @returns {Promise<void>} Promise<void>
 */
export const initUsageData = async (): Promise<void> => {
    try {
        await usageData.init(eventCategory);
        isInited = true;
        sendUsageData(EventAction.LAUNCH_APP, `v${pkgJson.version}`);
        sendUsageData(
            EventAction.REPORT_OS_INFO,
            `${process.platform}; ${process.arch}`
        );
    } catch (e) {
        console.warn('Usage data not available and will not be stored');
    }
};

/**
 * Send usage data event to Google Analytics
 * @param {EventAction} action The event action
 * @param {string} label The event label
 * @returns {void} Promise<void>
 */
export const sendUsageData = (action: EventAction, label: string): void => {
    if (!isInited) {
        eventQueue.push({ action, label });
        return;
    }
    if (eventQueue.length > 0) {
        eventQueue.forEach(e => {
            usageData.sendEvent(eventCategory, e.action, e.label || '');
        });
    }
    eventQueue = [];
    usageData.sendEvent(eventCategory, action, label || '');
};

/**
 * Send error usage data event to Google Analytics and also show it in the logger view
 * @param {EventAction} error The event action
 * @returns {void} void
 */
export const sendErrorReport = (error: string): void => {
    logger.error(error);
    sendUsageData(
        EventAction.REPORT_ERROR,
        `${process.platform}; ${process.arch}; v${pkgJson.version}; ${error}`
    );
};
