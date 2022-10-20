import {CollapsibleGroup, Button, logger } from 'pc-nrfconnect-shared';
import React from 'react';
import { useDispatch } from 'react-redux';
import { readPcapTrace, readRawTrace } from '../../features/tracing/nrfml';
import { askForPcapFile, askForTraceFile } from '../../utils/fileUtils';


export const LoadTraceFile = () => {
    const dispatch = useDispatch();

    const readRawFile = () => {
        const sourceFile = askForTraceFile();
        
        if (!sourceFile) {
            console.error('Could not select the provided file.');        
            return;
        }
        dispatch(readRawTrace(sourceFile));
    }

    const readPcapFile = () => {
        const sourceFile = askForPcapFile();

        if (!sourceFile) {
            console.error('Could not select the selected pcap file.');
            return;
        }
        dispatch(readPcapTrace(sourceFile));
    }


    return (
        <CollapsibleGroup heading="Read Trace">
            <Button className='w-100 btn-sm' onClick={readRawFile}>
                Read Trace from Raw File
            </Button>
            <Button className='w-100 btn-sm' onClick={readPcapFile}>
                Read Trace from Pcap File
            </Button>
        </CollapsibleGroup>
    ); 
}