/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcRenderer } from 'electron/renderer';

/**
 * This functionality should ideally be moved from the launcher
 * to shared if we intend for the apps to use these ipc-calls as well.
 */

export const openAppWindow = async (appName: string, source = 'official') => {
    const { apps } = (await ipcRenderer.invoke(
        'apps:get-downloadable-apps'
    )) as DownloadableApps;

    const selectedApp = apps.find(
        app => app.name === appName && app.source === source
    );
    if (selectedApp) {
        ipcRenderer.send('open:app', selectedApp);
    }
};

interface DownloadableApps {
    apps: { name: string; source: string }[];
}
