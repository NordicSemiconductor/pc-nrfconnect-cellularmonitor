/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { basename } from 'path';
import {
    Dropdown,
    DropdownItem,
    logger,
    truncateMiddle,
    usageData,
} from 'pc-nrfconnect-shared';

import {
    Database,
    getDatabases,
    getRemoteDatabases,
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

interface Props {
    disableAutoSelect?: boolean;
}

const autoSelectItem: DropdownItem = {
    label: 'Autoselect',
    value: 'autoselect',
};

const selectFromDiskItem = {
    label: 'Select Trace DB',
    value: 'select-trace-db',
};

export default ({ disableAutoSelect }: Props) => {
    const dispatch = useDispatch();
    const manualDbFilePath = useSelector(getManualDbFilePath);
    const [databases, setDatabases] = useState<Database[]>([]);
    const [selectedItem, setSelectedItem] = useState(
        disableAutoSelect ? selectFromDiskItem : autoSelectItem
    );
    const isTracing = useSelector(getIsTracing);

    const autoSelect = disableAutoSelect ? [] : [autoSelectItem];
    const items = [
        ...autoSelect,
        selectFromDiskItem,
        ...databases.map(database => ({
            label: database.version,
            value: database.uuid,
        })),
    ];

    useEffect(() => {
        getDatabases()
            .then(setDatabases)
            .then(getRemoteDatabases)
            .then(dbs => {
                if (dbs != null) {
                    setDatabases(dbs);
                }
            });
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

    const onSelect = async (item: DropdownItem) => {
        const label = typeof item.label === 'string' ? item.label : item.value;
        usageData.sendUsageData(EventAction.SELECT_TRACE_DATABASE, label);
        setSelectedItem(item);
        if (item.value === selectFromDiskItem.value) {
            const filePath = await askForTraceDbFile();
            if (filePath) {
                dispatch(setManualDbFilePath(filePath));
                storeManualDbFilePath(filePath);
                usageData.sendUsageData(EventAction.SET_TRACE_DB_MANUALLY);

                setSelectedItem({
                    label: truncateMiddle(basename(filePath), 10, 16),
                    value: 'select-trace-db',
                });
                logger.info(
                    `Database path successfully updated to ${filePath}`
                );
            }
        } else if (item.value === autoSelectItem.value) {
            deleteDbFilePath();
            dispatch(resetManualDbFilePath());
            logger.info(`Database path successfully reset to default value`);
        } else {
            dispatch(setSelectedTraceDatabaseFromVersion(label));
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
