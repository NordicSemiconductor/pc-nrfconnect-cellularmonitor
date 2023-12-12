/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    openUrl,
    usageData,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import EventAction from '../../app/usageDataActions';
import { askForPcapFile, askForWiresharkPath } from '../../common/fileUtils';
import {
    findWireshark,
    openInWireshark,
    WIRESHARK_DOWNLOAD_URL,
} from './wireshark';
import { getWiresharkPath, setWiresharkPath } from './wiresharkSlice';

import './wireshark.scss';

const LinkButton = ({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) => (
    <button
        className="tw-bg-transparent tw-border-none tw-p-0 tw-text-nordicBlue hover:tw-underline"
        type="button"
        onClick={onClick}
    >
        {label}
    </button>
);

export const SelectWireshark = ({ label }: { label: string }) => {
    const dispatch = useDispatch();

    const updateWiresharkPath = async () => {
        const filePath = await askForWiresharkPath();
        if (filePath) {
            usageData.sendUsageData(EventAction.SET_WIRESHARK_PATH);
            dispatch(setWiresharkPath(filePath));
        }
    };

    return <LinkButton label={label} onClick={updateWiresharkPath} />;
};

export default () => {
    const selectedWiresharkPath = useSelector(getWiresharkPath);
    const wiresharkPath = findWireshark(selectedWiresharkPath);
    const dispatch = useDispatch();

    const loadPcap = async () => {
        const filePath = await askForPcapFile();
        if (filePath) {
            usageData.sendUsageData(EventAction.OPEN_IN_WIRESHARK);
            dispatch(openInWireshark(filePath));
        }
    };

    return (
        <div className="wireshark">
            {wiresharkPath != null ? (
                <>
                    <Button
                        className="w-100"
                        variant="secondary"
                        onClick={loadPcap}
                    >
                        Open in Wireshark
                    </Button>
                    <div className="w-100 mt-2 text-center">
                        <SelectWireshark label="Or select a different Wireshark executable" />
                    </div>
                </>
            ) : (
                <>
                    <h6>Wireshark not detected</h6>
                    <div>
                        <LinkButton
                            onClick={() => openUrl(WIRESHARK_DOWNLOAD_URL)}
                            label="Install Wireshark"
                        />{' '}
                        or manually{' '}
                        <SelectWireshark label="specify install path" />.
                    </div>
                </>
            )}
        </div>
    );
};
