import React from 'react';
import { mdiContentCopy } from '@mdi/js';
import Icon from '@mdi/react';
import { clipboard } from 'electron';

interface Copy {
    data: string;
    size: number;
    style?: React.CSSProperties;
}
const Copy = ({ data, style, size }: Copy) => (
    <button
        style={{ ...style, background: 'transparent', border: 'none' }}
        type="button"
        onClick={() => clipboard.writeText(data)}
    >
        <Icon path={mdiContentCopy} size={size ?? 1} />
    </button>
);

export default Copy;
