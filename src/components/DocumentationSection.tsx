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
        linkLabel="Go to Infocenter"
        link="https://infocenter.nordicsemi.com/topic/ug_cellular_monitor/UG/cellular_monitor/intro.html"
    >
        Visit our Infocenter for more documentation about using the app.
    </DocumentationSection>,
    <DocumentationSection
        key="credentialManager"
        linkLabel="Certificate Manager"
        link="https://infocenter.nordicsemi.com/topic/ug_link_monitor/UG/link_monitor/lm_certificate_manager.html"
    >
        Visit our Infocenter for more documentation about managing credentials.
    </DocumentationSection>,
    <StartupDialog key="default-startup-dialog" />,
];

export default DocumentationSections;
