import crypto from 'crypto';
import { createCanvas, loadImage as htmlLoadImage } from 'canvas';
import axios from 'axios';
import Tesseract from 'node-tesseract-ocr';
// const tesseract = require("node-tesseract-ocr")
import sharp from 'sharp';
import * as fs from 'fs';
import { error } from 'console';
// import cv from 'opencv4nodejs';

interface ImageType {
    url: string;
    data: any;
    height?: number;
    width?: number;
}

export function loadImage(url: string, size: number): Promise<string> {
    // return new Promise((resolve, reject) => {
    //     axios
    //         .head(url, { timeout: 100000 })
    //         .then((res) => {
    //             const contentLength = parseInt(res.headers['content-length'], 10);

    //             const isTooLarge = contentLength > 10000000;
    //             if (isTooLarge) resolve('large');
    //             else
    //                 axios
    //                     .get(url, { responseType: 'arraybuffer', timeout: 100000, maxContentLength: 10 * 1024 * 1024 })
    //                     .then((res) => {
    //                         // const result = Buffer.from(res.data, 'binary')
    //                         resolve(res.data);
    //                     })
    //                     .catch((err) => {
    //                         console.log(err);
    //                         resolve('large');
    //                         // reject(`Failed to load image: ${url}`);
    //                     });
    //         })
    //         .catch((error) => {
    //             console.log(error);
    //             resolve('large');
    //         });

    // htmlLoadImage(url)
    //     .then((image) => {
    //         const canvas = createCanvas(size, size); // create a new canvas object
    //         const ctx = canvas.getContext('2d'); // get the 2D context of the canvas
    //         canvas.width = image.width;
    //         canvas.height = image.height;

    //         ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    //         const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    //         const imageData = {
    //             url: url,
    //             data: data,
    //         };
    //         resolve(data as any);
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //         resolve('large');
    //         // reject(`Failed to load image: ${url}`);
    //     });
    // });
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
            fs.createWriteStream(targetPath).on('finish', () => {
                if (isResize) compressImage(targetPath, targetPath);
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
            lang: 'chi_tra',
            psm: 6,
            // tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        });

        console.log(result);
        return result;
    } catch (error) {
        console.log('failed image to text');
        return '';
    }
}

export async function compressImage(inputFilePath: string, outputFilePath: string): Promise<void> {
    const inputBuffer: Buffer = fs.readFileSync(inputFilePath);
    await sharp(inputBuffer)
        .resize({ width: 800 }) // resize to a maximum width of 800 pixels
        .png({ quality: 70 }) // compress as JPEG with 70% quality
        .toFile(outputFilePath);
}
