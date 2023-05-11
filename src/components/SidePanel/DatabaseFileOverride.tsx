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
    getDatabases,
    setSelectedTraceDatabaseFromVersion,
} from '../../features/tracing/traceDatabase';
import {
    getIsTracing,
    getManualDbFilePath,
    resetManualDbFilePath,
    setManualDbFilePath,
} from '../../features/tracing/traceSlice';
import EventAction from '../../usageDataActions';
import { askForTraceDbFile } from '../../utils/fileUtils';
import { deleteDbFilePath, storeManualDbFilePath } from '../../utils/store';

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
    const [databases, setDatabases] = useState<Database[]>([]);
    const [selectedItem, setSelectedItem] = useState(autoSelectItem);
    const isTracing = useSelector(getIsTracing);

    const items = [
        autoSelectItem,
        selectFromDiskItem,
        ...databases.map(database => ({
            label: database.version,
            value: database.uuid,
        })),
    ];

    useEffect(() => {
        getDatabases().then(setDatabases);
    }, []);

    useEffect(() => {
        const selectedDatabase = databases.find(file =>
            manualDbFilePath?.includes(
                // eslint-disable-next-line no-template-curly-in-string
                file.path.replace('${root}', '')
            )
        );
        if (selectedDatabase) {
            setSelectedItem({
                label: selectedDatabase?.version,
                value: selectedDatabase?.uuid,
            });
        }
    }, [databases, manualDbFilePath]);

    const onSelect = (item: DropdownItem) => {
        usageData.sendUsageData(EventAction.SELECT_TRACE_DATABASE, item.label);
        setSelectedItem(item);
        if (item.value === selectFromDiskItem.value) {
            const manualDbPath = askForTraceDbFile();
            if (manualDbPath) {
                dispatch(setManualDbFilePath(manualDbPath));
                storeManualDbFilePath(manualDbPath);
                usageData.sendUsageData(EventAction.SET_TRACE_DB_MANUALLY);
                logger.info(
                    `Database path successfully updated to ${manualDbPath}`
                );
            }
        } else if (item.value === autoSelectItem.value) {
            deleteDbFilePath();
            dispatch(resetManualDbFilePath());
            logger.info(`Database path successfully reset to default value`);
        } else {
            dispatch(setSelectedTraceDatabaseFromVersion(item.label));
        }
    };

    return (
        <Dropdown
            disabled={isTracing}
            label="Trace database"
            items={items}
            onSelect={onSelect}
            selectedItem={selectedItem}
        />
    );
};
