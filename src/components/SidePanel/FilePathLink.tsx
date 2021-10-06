/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import FormLabel from 'react-bootstrap/FormLabel';

import { truncateMiddle } from '../../utils';
import { openInFolder } from '../../utils/fileUtils';

type FilePathLinkProps = {
    filePath: string;
    label?: JSX.Element | string;
    clipStart?: number;
    clipEnd?: number;
    displayPath?: string;
};

export default ({
    filePath,
    label,
    clipStart,
    clipEnd,
    displayPath = filePath,
}: FilePathLinkProps) => (
    <div className="filepath-container">
        {label && <FormLabel className="w-100">{label}</FormLabel>}
        <Button
            variant="link"
            className="filepath-link"
            title={filePath}
            onClick={() => openInFolder(filePath)}
        >
            {truncateMiddle(displayPath, clipStart, clipEnd)}
        </Button>
    </div>
);
