/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import { Alert, openUrl } from 'pc-nrfconnect-shared';

import {
    getHideNrfCommandLineAlert,
    persistHideNrfCommandLineAlert,
} from '../../utils/store';
import ConvertTraceCard from './ConvertTraceCard';
import CreateTraceCard from './CreateTraceCard';
import FeedbackCard from './FeedbackCard';

import './dashboard.scss';

const NRF_COMMAND_LINE_TOOL_URL =
    'https://www.nordicsemi.com/Products/Development-tools/nrf-command-line-tools/download';

export default () => {
    const [hideNrfCmdLineAlert, setHideNrfCmdLineAlert] = React.useState(
        getHideNrfCommandLineAlert()
    );

    return (
        <div className="dashboard-container">
            <div className="dashboard">
                <Alert variant="info" label="Experimental release!">
                    This is an unsupported, experimental preview and it is
                    subject to major redesigns in the future.
                </Alert>
                {!hideNrfCmdLineAlert && (
                    <Alert
                        dismissable
                        onClose={() => {
                            setHideNrfCmdLineAlert(true);
                            persistHideNrfCommandLineAlert();
                        }}
                        variant="warning"
                    >
                        Please ensure that you have
                        <Button
                            variant="link"
                            className="alert-links"
                            title={NRF_COMMAND_LINE_TOOL_URL}
                            onClick={() => openUrl(NRF_COMMAND_LINE_TOOL_URL)}
                        >
                            nRF Command Line Tools
                        </Button>
                        version 10.15.0 or newer installed
                    </Alert>
                )}
                <div className="dashboard-cards">
                    <CreateTraceCard />
                    <ConvertTraceCard />
                    <FeedbackCard />
                </div>
            </div>
        </div>
    );
};
