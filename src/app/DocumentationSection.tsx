/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { DocumentationSection } from '@nordicsemiconductor/pc-nrfconnect-shared';

import StartupDialog from '../features/startup/startupDialog';

const DocumentationSections = [
    <DocumentationSection
        key="infocenter"
        linkLabel="Go to TechDocs"
        link="https://docs.nordicsemi.com/bundle/nrf-connect-cellularmonitor/page/index.html"
    >
        Visit our Technical Documentation for more documentation about using the app.
    </DocumentationSection>,
    <DocumentationSection
        key="credentialManager"
        linkLabel="Certificate Manager"
        link="https://docs.nordicsemi.com/bundle/nrf-connect-linkmonitor/page/lm_certificate_manager.html"
    >
        Visit our Technical Documentation for more documentation about managing credentials.
    </DocumentationSection>,
    <StartupDialog key="default-startup-dialog" />,
];

export default DocumentationSections;
