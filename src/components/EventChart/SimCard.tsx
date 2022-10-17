import React from 'react';
import { useDispatch, useSelector } from 'react-redux'
import DashboardCard from '../Dashboard/DashboardCard';
import { rawTraceData } from '../../../data/trace';
import { Packet } from '../../at';
import { convertWrapper as convert} from '../../at/atActions';
import { TDispatch } from 'pc-nrfconnect-shared/src/state';
import { getAT } from '../../at/atSlice';


function readFileToState(dispatch: TDispatch) {
    console.log("Will read file and set state");
    rawTraceData.map(
        jsonPacket => {
            const packet = {
                format: jsonPacket.format,
                packet_data: new Uint8Array(jsonPacket.packet_data.data),
            } as Packet
            dispatch(convert(packet));
        }
    );
    console.log("Finished reading file...");
}


export default () => {
    // const simCardState = useSelector(getSimCardState());
    const dispatch = useDispatch();
    const ATView = useSelector(getAT);


    let something = {
        IMSI: false ,
        Operator: ATView.xmonitor?.operatorFullName ?? 'Unknown',
        ICCID: false,
        ODIS: false,
        PIN: false,
        PUK: false,
        "Device manufacturer?": false,
        "Remaining PIN retries": 'unknown',
        "Restricted SIM Access?": false,
        "Generic SIM Access?": false,
    }

    return (
        <DashboardCard title="Sim Card" iconName='mdi-sim' onclick={() => readFileToState(dispatch)}>
            <ul>
                {Object.entries(something).map(([key, value], index) => {
                    console.log(key, value);
                    return (<li>{key}: {value}</li>)
                })}
            </ul>
        </DashboardCard>
    )

}