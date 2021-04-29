import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Group } from 'pc-nrfconnect-shared';

import { setSerialPort } from '../actions';
import { getAvailableSerialPorts } from '../reducer';

type SerialPortProps = {
    selectedSerialPort: string;
};

export default ({ selectedSerialPort }: SerialPortProps) => {
    const dispatch = useDispatch();
    const availableSerialPorts = useSelector(getAvailableSerialPorts);

    const updateSerialPort = (port: string) => () =>
        dispatch(setSerialPort(port));

    return (
        <Group heading="Serialport trace capture">
            <div className="serialport-selection">
                {availableSerialPorts.map(port => (
                    <div className="serialport-select" key={port}>
                        <input
                            type="radio"
                            name="serialport-select"
                            id={`select-sp-${port}`}
                            value={port}
                            checked={port === selectedSerialPort}
                            onChange={updateSerialPort(port)}
                        />
                        <label htmlFor={`select-sp-${port}`}>
                            <strong>{port}</strong>
                        </label>
                    </div>
                ))}
            </div>
        </Group>
    );
};
