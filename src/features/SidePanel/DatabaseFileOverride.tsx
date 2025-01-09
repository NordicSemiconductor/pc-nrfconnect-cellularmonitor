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
    selectedDevice,
    selectedDeviceInfo,
    telemetry,
    truncateMiddle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { basename } from 'path';

import { deleteDbFilePath, storeManualDbFilePath } from '../../app/store';
import EventAction from '../../app/usageDataActions';
import { askForTraceDbFile } from '../../common/fileUtils';
import { getDeviceKeyForTraceDatabaseEntries } from '../programSample/programSample';
import {
    DatabaseVersion,
    getDatabases,
    getRemoteDatabases,
    setSelectedTraceDatabaseFromVersion,
} from '../tracing/traceDatabase';
import {
    getIsTracing,
    getManualDbFilePath,
    resetManualDbFilePath,
    setManualDbFilePath,
} from '../tracing/traceSlice';

const autoSelectItem: DropdownItem = {
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
    const [databases, setDatabases] = useState<DatabaseVersion[]>([]);
    const [selectedItem, setSelectedItem] = useState(autoSelectItem);
    const isTracing = useSelector(getIsTracing);
    const device = useSelector(selectedDevice);
    const deviceInfo = useSelector(selectedDeviceInfo);
    const nrfDeviceVersion = getDeviceKeyForTraceDatabaseEntries(
        device,
        deviceInfo
    );

    const items = [
        autoSelectItem,
        selectFromDiskItem,
        ...databases
            .map(database => ({
                label: database.version,
                value: database.uuid,
            }))
            .reverse(),
    ];

    useEffect(() => {
        console.log('Device has changed');
        setSelectedItem(autoSelectItem);
    }, [device]);

    useEffect(() => {
        getDatabases(nrfDeviceVersion)
            .then(setDatabases)
            .then(() => getRemoteDatabases(nrfDeviceVersion))
            .then(dbs => {
                if (dbs != null) {
                    setDatabases(dbs);
                }
            });
    }, [nrfDeviceVersion]);

    useEffect(() => {
        const selectedDatabase = databases.find(file =>
            manualDbFilePath?.includes(
                // eslint-disable-next-line no-template-curly-in-string
                file.database.path.replace('${root}', '')
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
        telemetry.sendEvent(EventAction.SELECT_TRACE_DATABASE, {
            selectedTraceDatabase: label,
        });
        setSelectedItem(item);
        if (item.value === selectFromDiskItem.value) {
            const filePath = await askForTraceDbFile();
            if (filePath) {
                dispatch(setManualDbFilePath(filePath));
                storeManualDbFilePath(filePath);
                telemetry.sendEvent(EventAction.SET_TRACE_DB_MANUALLY);

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
            dispatch(
                setSelectedTraceDatabaseFromVersion(label, nrfDeviceVersion)
            );
        }
    };

    return (
        <Dropdown
            disabled={isTracing}
            label="Modem trace database"
            items={items}
            onSelect={onSelect}
            selectedItem={selectedItem}
            numItemsBeforeScroll={10}
        />
    );
};
