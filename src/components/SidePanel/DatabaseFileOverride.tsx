/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { readFile } from 'fs/promises';
import { join } from 'path';
import {
    Dropdown,
    DropdownItem,
    logger,
    usageData,
} from 'pc-nrfconnect-shared';

import {
    resetManualDbFilePath,
    setManualDbFilePath,
} from '../../features/tracing/traceSlice';
import EventAction from '../../usageDataActions';
import { askForTraceDbFile } from '../../utils/fileUtils';
import { autoDetectDbRootFolder } from '../../utils/store';

type Version = {
    database: {
        path: string;
        sha256: string;
    };
    uuid: string;
    version: string;
};

const traceFiles = readFile(join(autoDetectDbRootFolder(), 'config.json'), {
    encoding: 'utf-8',
})
    .then(JSON.parse)
    .then(
        config => config.firmwares.devices[0].versions.reverse() as Version[]
    );

const autoSelectItem = {
    label: 'Autoselect',
    value: 'autoselect',
};

const selectFromDiskItem = {
    label: 'Select Trace DB',
    value: 'select-trace-db',
};

export default () => {
    const dispatch = useDispatch();
    const [versions, setVersions] = useState<Version[]>([]);
    const [selectedItem, setSelectedItem] = useState(autoSelectItem);
    const items = [
        autoSelectItem,
        selectFromDiskItem,
        ...versions.map(version => ({
            label: version.version,
            value: version.uuid,
        })),
    ];

    useEffect(() => {
        traceFiles.then(setVersions);
    }, []);

    const onSelect = (item: DropdownItem) => {
        setSelectedItem(item);
        if (item.value === selectFromDiskItem.value) {
            const manualDbPath = askForTraceDbFile();
            if (manualDbPath) {
                dispatch(setManualDbFilePath(manualDbPath));
                usageData.sendUsageData(EventAction.SET_TRACE_DB_MANUALLY);
                logger.info(
                    `Database path successfully updated to ${manualDbPath}`
                );
            }
        } else if (item.value === autoSelectItem.value) {
            dispatch(resetManualDbFilePath());
            logger.info(`Database path successfully reset to default value`);
        } else {
            const selectedVersion = versions.find(
                version => version.uuid === item.value
            );
            const file = join(
                autoDetectDbRootFolder(),
                selectedVersion?.database.path.replace(`\${root}`, '') ?? ''
            );
            dispatch(setManualDbFilePath(file));
        }
    };

    return (
        <>
            <p>Trace database</p>
            <Dropdown
                items={items}
                onSelect={onSelect}
                selectedItem={selectedItem}
            />
        </>
    );
};
