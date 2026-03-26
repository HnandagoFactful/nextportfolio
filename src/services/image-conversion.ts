import axios from 'axios';
import * as mimeTypes from 'mime-types';

export default async function imageConversion({
    data,
    format,
    flip,
    resize
}: {
    data: File;
    format: string;
    flip: '1' | '0';
    resize: [number, number]
}) {
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_PROCESSOR_URL ?? 'http://localhost:3002'
    const response = await axios.post(`${baseUrl}/convert?resize=${resize}&format=${format}&flip=${flip}`, data, {
        headers: { 'Content-Type': data.type },
        responseType: 'blob'
    })
    const variant = mimeTypes.lookup(format);
    if (variant) {
        const file = new Blob([response.data], {type: variant})
        return file;
    }
    return undefined;
}