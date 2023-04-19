/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dropdown,
    DropdownItem,
    logger,
    usageData,
} from 'pc-nrfconnect-shared';

import {
    Database,
    databases,
    setSelectedTraceDatabaseFromVersion,
} from '../../features/tracing/traceDatabase';
import {
    getManualDbFilePath,
    resetManualDbFilePath,
    setManualDbFilePath,
} from '../../features/tracing/traceSlice';
import EventAction from '../../usageDataActions';
import { askForTraceDbFile } from '../../utils/fileUtils';

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
    const manualDbFilePath = useSelector(getManualDbFilePath);
    const [versions, setVersions] = useState<Database[]>([]);
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
        (async () => {
            const files = await databases();
            const selectedFile = files.find(file =>
                manualDbFilePath?.includes(
                    // eslint-disable-next-line no-template-curly-in-string
                    file.path.replace('${root}', '')
                )
            );
            setVersions(files);
            if (selectedFile) {
                setSelectedItem({
                    label: selectedFile?.version,
                    value: selectedFile?.uuid,
                });
            }
        })();
    }, [manualDbFilePath]);

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
            dispatch(setSelectedTraceDatabaseFromVersion(item.label));
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
