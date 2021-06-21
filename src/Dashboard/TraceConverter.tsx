import React from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch } from 'react-redux';

import { convertTraceFile } from '../nrfml/nrfml';
import { askForTraceFile } from '../utils/fileUtils';

export default () => {
    const dispatch = useDispatch();

    const loadTrace = () => {
        const file = askForTraceFile();
        if (file) {
            dispatch(convertTraceFile(file));
        }
    };

    return (
        <Button
            className="w-100 secondary-btn"
            variant="secondary"
            onClick={loadTrace}
        >
            Convert Raw Trace to PCAP
        </Button>
    );
};
