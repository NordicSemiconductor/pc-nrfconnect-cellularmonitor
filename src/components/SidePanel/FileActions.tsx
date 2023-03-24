import React from 'react';
import { Button, Group } from 'pc-nrfconnect-shared';

import { LoadTraceFile } from './LoadTraceFile';

export default () => (
    <Group heading="FILE ACTIONS">
        <LoadTraceFile />
        <Button
            variant="secondary"
            className="w-100"
            onClick={() => {
                alert('Sorry! Not implemented yet');
            }}
        >
            Open file in Wireshark...
        </Button>
    </Group>
);
