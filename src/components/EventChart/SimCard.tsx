import React from 'react';
import { useSelector } from 'react-redux';

import { getAT } from '../../at/atSlice';
import DashboardCard from '../Dashboard/DashboardCard';

export default () => {
    const ATView = useSelector(getAT);

    const something = {
        IMSI: false,
        Operator: ATView.xmonitor?.operatorFullName ?? 'Unknown',
        ICCID: false,
        ODIS: false,
        PIN: false,
        PUK: false,
        'Device manufacturer?': false,
        'Remaining PIN retries': 'unknown',
        'Restricted SIM Access?': false,
        'Generic SIM Access?': false,
    };

    return (
        <DashboardCard title="Sim Card" iconName="mdi-sim" onclick={() => {}}>
            <ul>
                {Object.entries(something).map(([key, value], index) => {
                    console.log(key, value);
                    return (
                        <li key={key}>
                            {key}: {value}
                        </li>
                    );
                })}
            </ul>
        </DashboardCard>
    );
};
