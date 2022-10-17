import React from 'react';
import DashboardCard from '../Dashboard/DashboardCard';

export default () => {
    // const simCardState = useSelector(getSimCardState());

    let something = {
        IMSI: false ,
        Operator: false ,
        ICCID: false,
        ODIS: false,
        PIN: false,
        PUK: false,
        "Device manufacturer?": false,
        "Remaining PIN retries": false,
        "Restricted SIM Access?": false,
        "Generic SIM Access?": false,
    }

    return (
        <DashboardCard title="Sim Card" iconName='mdi-sim' onclick={() => {}}>
            <ul>
                {Object.entries(something).map(([key, value], index) => {
                    console.log(key, value);
                    return (<li>{key}: {value}</li>)
                })}
            </ul>
        </DashboardCard>
    )

}