import { ChartType } from 'chart.js';

interface DragSelectOptions {
    updateTime(time: number): void;
}

declare module 'chart.js' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface PluginOptionsByType<TType extends ChartType> {
        dragSelectTime: DragSelectOptions;
    }
}
