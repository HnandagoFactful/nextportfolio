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
    const form = new FormData()
    form.append('file', data)
    const response = await axios.post(`http://localhost:3002/api/images?resize${resize}&format=${format}&flip=${flip}`, form,  {
        responseType: 'blob'
    })
    const variant = mimeTypes.lookup(format);
    if (variant) {
        const file = new Blob([response.data], {type: variant})
        return file;
    }
    return undefined;
}