/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import {
    Button,
    Device,
    Dropdown,
    DropdownItem,
    Group,
    openAppWindow,
    selectedDevice,
    SidePanel,
} from 'pc-nrfconnect-shared';

import AdvancedOptions from './AdvancedOptions';
import EventGraphOptions from './EventGraphOptions';
import Instructions from './Instructions';
import { LoadTraceFile } from './LoadTraceFile';
import PowerEstimationParams from './PowerEstimationParams';
import TraceCollector from './Tracing/TraceCollector';
import TraceFileInformation from './Tracing/TraceFileInformation';

import './sidepanel.scss';
import './Tracing/tracing.scss';

export const PowerEstimationSidePanel = () => (
    <SidePanel>
        <PowerEstimationParams />
    </SidePanel>
);

export const TraceCollectorSidePanel = () => (
    <SidePanel className="side-panel">
        <Instructions />
        <TraceCollector />
        <TraceFileInformation />
        <AdvancedOptions />
        <LoadTraceFile />

        <EventGraphOptions />
        <OpenSerialTerminal />
    </SidePanel>
);

const OpenSerialTerminal = () => {
    const [sources, setSources] = useState<string[]>([]);
    const [selectedSource, setSelectedSource] = useState<DropdownItem | null>(
        null
    );
    const device = useSelector(selectedDevice);

    useEffect(() => {
        const getSources = async () => {
            const localApps = (await ipcRenderer.invoke(
                'apps:get-local-apps'
            )) as { name: string; source: string }[];
            const localSources = localApps
                .filter(app => app.name === 'pc-nrfconnect-serial-terminal')
                .map(app => app.source);
            const { apps: downloadableApps } = (await ipcRenderer.invoke(
                'apps:get-downloadable-apps'
            )) as {
                apps: {
                    name: string;
                    source: string;
                    currentVersion: string;
                }[];
            };
            console.log(downloadableApps);
            const downloadableSources = downloadableApps
                .filter(
                    app =>
                        app.name === 'pc-nrfconnect-serial-terminal' &&
                        app.currentVersion != null
                )
                .map(app => app.source);
            setSources([...localSources, ...downloadableSources]);
        };

        getSources();
    }, []);

    const sourceItems = useMemo(
        () =>
            sources.length > 0
                ? [
                      ...sources.map(source => ({
                          label: source,
                          value: source,
                      })),
                  ]
                : [{ label: 'Not Installed', value: '' }],
        [sources]
    );

    useEffect(() => {
        setSelectedSource(sourceItems[0]);
    }, [sourceItems]);

    if (device === undefined) {
        return null;
    }
    return (
        <Group heading="Open Serial Terminal">
            <Button
                large
                className="btn-secondary w-100"
                onClick={() =>
                    openSerialTerminal(
                        device,
                        selectedSource?.value ?? 'official'
                    )
                }
                disabled={sources.length === 0}
            >
                Open Serial Terminal
            </Button>

            {sources.length > 1 ? (
                <Dropdown
                    selectedItem={selectedSource ?? sourceItems[0]}
                    items={sourceItems}
                    onSelect={item => setSelectedSource(item)}
                />
            ) : null}
        </Group>
    );
};

const openSerialTerminal = (device: Device, source = 'official') => {
    // For the moment we assume we only want to open the first available port
    const vComIndex = 0;
    const ports = device.serialPorts;
    const serialPort = ports !== undefined ? ports[vComIndex] : undefined;
    const serialPortPath = serialPort?.path ?? undefined;

    openAppWindow(
        { name: 'pc-nrfconnect-serial-terminal', source },
        {
            device: {
                serialNumber: device.serialNumber,
                serialPortPath,
            },
        }
    );
};
