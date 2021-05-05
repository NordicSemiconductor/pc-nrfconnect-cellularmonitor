import React from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch } from 'react-redux';
import { logger } from 'pc-nrfconnect-shared';

import { convertTraceFile } from '../nrfml/nrfml';
import { askForTraceFile } from '../utils/fileUtils';

export default () => {
    const dispatch = useDispatch();

    const loadTrace = () => {
        const file = askForTraceFile();
        if (!file) {
            logger.error('Invalid file, please select a valid trace file');
            return;
        }
        dispatch(convertTraceFile(file));
    };

    return (
        <Button
            className="w-100 secondary-btn"
            variant="primary"
            onClick={loadTrace}
        >
            Convert Trace
        </Button>
    );
};
