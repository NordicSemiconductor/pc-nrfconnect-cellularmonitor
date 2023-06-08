/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { DocumentationSection } from 'pc-nrfconnect-shared';

import StartupDialog from '../features/startup/startupDialog';

const DocumentationSections = [
    // <DocumentationSection
    //     key="infocenter"
    //     linkLabel="Go to Infocenter"
    //     link="https://infocenter.nordicsemi.com/topic/ug_trace_collector/UG/trace_collector/intro.html"
    // >
    //     Visit our Infocenter for more documentation about using the app.
    // </DocumentationSection>,
    <DocumentationSection
        key="credentialManager"
        linkLabel="Credential Manager"
        link="https://infocenter.nordicsemi.com/topic/ug_link_monitor/UG/link_monitor/lm_certificate_manager.html"
    >
        Visit our Infocenter for more documentation about using the app.
    </DocumentationSection>,
    <StartupDialog key="default-startup-dialog" />,
];

export default DocumentationSections;
