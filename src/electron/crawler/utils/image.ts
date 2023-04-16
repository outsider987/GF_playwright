import crypto from 'crypto';
import axios from 'axios';
import Tesseract from 'node-tesseract-ocr';
// const tesseract = require("node-tesseract-ocr")
import sharp from 'sharp';
import * as fs from 'fs';
import { error } from 'console';
import { convertToTraditionalChinese } from './utils';
// import cv from 'opencv4nodejs';

interface ImageType {
    url: string;
    data: any;
    height?: number;
    width?: number;
}

export function loadImage(url: string, size: number): Promise<string> {
    return new Promise((resolve, reject) => {
        axios
            .get(url, { responseType: 'arraybuffer', timeout: 10000, maxContentLength: 2 * 1024 * 1024 })
            .then((res) => {
                // const result = Buffer.from(res.data, 'binary')
                resolve(res.data);
            })
            .catch((err) => {
                console.log(err);
                resolve('large');
                // reject(`Failed to load image: ${url}`);
            });
    });
}
function hashImage(binaryData: any): string {
    const hash = crypto.createHash('sha1');
    hash.update(binaryData);
    return hash.digest('hex');
}
export const downloadImage = (imageUrl: string, input: any, path: string, isResize: boolean) => {
    return axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream',
    }).then((response) => {
        const contentType = response.headers['content-type'];
        const extension = contentType.split('/')[1];
        let filename = `${input}.${extension}`;
        const targetPath = `${path}/${filename}`;
        response.data.pipe(
            fs
                .createWriteStream(targetPath)
                .on('finish', () => {
                    if (isResize) compressImage(targetPath, targetPath);
                })
                .on('error', (err) => {
                    fs.unlink(targetPath, (err) => {
                        if (err) throw err;
                        console.log('File deleted successfully!');
                    });
                }),
        );
        return { url: imageUrl, filename };
    });
};

export async function removeSimilarImages(images: string[]) {
    console.log(' start removeSimilarImages');
    const uniqueImages: string[] = [];
    const removedIndices: number[] = [];
    const imageHashes = new Map<string, number>();

    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const hash = hashImage(image);
        if (image === 'large') continue;
        if (imageHashes.has(hash)) {
            const similarIndex = imageHashes.get(hash);
            removedIndices.push(i);
        } else {
            imageHashes.set(hash, i);
            uniqueImages.push(image);
        }
    }

    return { uniqueImages, removedIndices };
}

export async function recognizeImage(url: string): Promise<string> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
        const preprocessedImage = await sharp(response.data).resize(1200).greyscale().normalize().sharpen().toBuffer();

        // Extract text using Tesseract.js with the chi_tra language data
        const result = await Tesseract.recognize(preprocessedImage, {
            lang: 'chi_sim',
            psm: 3,
            // oem: 1,
            // dpi: 150,

            // tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        });

        console.log(result);
        return convertToTraditionalChinese(result);
    } catch (error) {
        console.log(error);
        console.log('failed image to text');
        return '';
    }
}

export async function compressImage(inputFilePath: string, outputFilePath: string): Promise<void> {
    const inputBuffer: Buffer = fs.readFileSync(inputFilePath);
    const fileSizeInBytes = inputBuffer.length;
    const fileSizeInKilobytes = fileSizeInBytes / 1024;
    if (fileSizeInKilobytes > 300)
        await sharp(inputBuffer)
            .resize({ width: 800 }) // resize to a maximum width of 800 pixels
            .png({ quality: 70 }) // compress as JPEG with 70% quality
            .toFile(outputFilePath);
}
