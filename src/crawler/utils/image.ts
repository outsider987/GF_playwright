import crypto from 'crypto';
import { createCanvas, loadImage as htmlLoadImage } from 'canvas';
import axios from 'axios';
import Tesseract from 'node-tesseract-ocr';
// const tesseract = require("node-tesseract-ocr")
import sharp from 'sharp';
import * as fs from 'fs';
// import cv from 'opencv4nodejs';

interface ImageType {
    url: string;
    data: any;
    height?: number;
    width?: number;
}

export function loadImage(url: string, size: number): Promise<ImageType> {
    return new Promise((resolve, reject) => {
        htmlLoadImage(url)
            .then((image) => {
                const canvas = createCanvas(size, size); // create a new canvas object
                const ctx = canvas.getContext('2d'); // get the 2D context of the canvas
                canvas.width = image.width;
                canvas.height = image.height;

                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                const imageData = {
                    url: url,
                    data: data,
                };
                resolve(imageData);
            })
            .catch((err) => {
                console.log(err);
            });
        reject(`Failed to load image: ${url}`);
    });
}
function hashImage(image: ImageType): string {
    const hash = crypto.createHash('sha1');
    hash.update(image.data);
    return hash.digest('hex');
}
export const downloadImage = (imageUrl: string, input: any, path: string) => {
    return axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream',
    }).then((response) => {
        const contentType = response.headers['content-type'];
        const extension = contentType.split('/')[1];
        let filename = `${input}.${extension}`;

        response.data.pipe(fs.createWriteStream(`${path}/${filename}`));
        return { url: imageUrl, filename };
    });
};

export async function removeSimilarImages(images: ImageType[]) {
    const uniqueImages: ImageType[] = [];
    const removedIndices: number[] = [];
    const imageHashes = new Map<string, number>();

    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const hash = hashImage(image);

        if (imageHashes.has(hash)) {
            const similarIndex = imageHashes.get(hash);

            if (!removedIndices.includes(similarIndex)) {
                removedIndices.push(similarIndex);
            }
        } else {
            imageHashes.set(hash, i);
            uniqueImages.push(image);
        }
    }

    return { uniqueImages, removedIndices };
}

export async function recognizeImage(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const preprocessedImage = await sharp(response.data).resize(1200).greyscale().normalize().sharpen().toBuffer();

    // Extract text using Tesseract.js with the chi_tra language data
    const result = await Tesseract.recognize(preprocessedImage, {
        lang: 'chi_tra',
        psm: 6,
        // tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    });

    console.log(result);
    return result;
}
