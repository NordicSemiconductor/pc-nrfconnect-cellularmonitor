/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import axios from 'axios';
import { Button, isDevelopment, logger } from 'pc-nrfconnect-shared';

import './FeedbackForm.scss';

export default () => {
    const [feedback, setFeedback] = useState('');
    const [sayThankYou, setSayThankYou] = useState(true);

    if (sayThankYou === true) {
        return (
            <div className="feedback-form-wrapper">
                <div className="feedback-form-container">
                    <h2 className="mb-3">Thank you!</h2>
                    <section>
                        <p>
                            We value your feedback and any ideas you may have
                            for improving our applications.
                        </p>
                        <p>
                            Click the button below in order to send more
                            feedback.
                        </p>
                    </section>
                    <Button
                        large
                        className="btn-secondary"
                        onClick={() => setSayThankYou(false)}
                    >
                        Give more feedback
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="feedback-form-wrapper">
            <div className="feedback-form-container">
                <h2 className="mb-3">Give Feedback</h2>
                <section>
                    <p>
                        We value your feedback and any ideas you may have for
                        improving our applications. Please use the form below to
                        give feedback.
                    </p>
                    <p>
                        Note: this is not a support channel, and you will not
                        receive a response. For help and support, visit the{' '}
                        <a href="https://devzone.nordicsemi.com/">
                            Nordic DevZone
                        </a>
                        .
                    </p>
                </section>
                <form className="feedback-form">
                    <label htmlFor="feedback-text">
                        <b>What is your feedback?</b>
                        <textarea
                            name="feedback-text"
                            className="feedback-text mb-3"
                            required
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                        />
                    </label>
                </form>
                <Button
                    large
                    className="btn-primary"
                    onClick={() => handleFormData(feedback, setSayThankYou)}
                >
                    Send Feedback
                </Button>
            </div>
        </div>
    );
};

const formURL =
    isDevelopment === true
        ? 'https://formkeep.com/f/8deb409a565'
        : 'https://formkeep.com/f/36b394b92851';

const handleFormData = (
    feedback: string,
    setResponse: (response: boolean) => void
) => {
    const data = {
        app: 'pc-nrfconnect-cellularmonitor',
        feedback,
        platform: process.platform,
    };

    axios
        .post(formURL, JSON.stringify(data), {
            headers: {
                'Cotent-Type': 'application/json',
                enctype: 'multipart/form-data',
            },
        })
        .then(response => {
            console.log(response);
            setResponse(true);
        })
        .catch(error => {
            if (error.response) {
                logger.error(
                    `FeedbackForm: Could not send feedback, got status code=${error.response.status} with response: ${error.response.data}`
                );
            }
        });
};
