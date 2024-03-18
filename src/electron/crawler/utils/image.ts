import crypto from 'crypto';
import axios from 'axios';
import cv from 'opencv4nodejs';
// const cv = require('opencv.js');

import NodeTesseract from 'node-tesseract-ocr';

import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import * as fs from 'fs';
import { error } from 'console';

// Load 'opencv.js' assigning the value to the global variable 'cv'

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

// async function detectText(imageBuffer: Buffer) {
//     const img = cv.imdecode(imageBuffer);

//     // Convert image to grayscale
//     const grayImg = img.cvtColor(cv.COLOR_BGR2GRAY);

//     // Use a text detection algorithm (e.g., EAST text detector)
//     const textDetector = new cv.readNetFromCaffe();
//     const [, scores] = await textDetector.detect(grayImg);

//     // Filter out low-confidence text detections
//     const highConfidenceIndices = scores
//         .map((score: any, index: any) => [score, index])
//         .filter(([score]: any) => score > 0.5)
//         .map(([, index]: any) => index);

//     // Draw bounding boxes around detected text
//     const boxes = await textDetector.detect(grayImg);
//     const outputImg = img.copy();
//     for (const i of highConfidenceIndices) {
//         const box = boxes[i];
//         outputImg.drawRectangle(
//             new cv.Point2(box.x, box.y),
//             new cv.Point2(box.x + box.width, box.y + box.height),
//             new cv.Vec3(0, 255, 0), // Green color
//             2
//         );
//     }

//     // Show the image with detected text
//     cv.imshow('Detected Text', outputImg);
//     cv.waitKey(0);

//     const extractedText = await Tesseract.recognize(buffer, { lang: 'eng' });

//     return extractedText;

// }

const SharpDetect = async (data: any) => {
    const preprocessedImage = await sharp(data).resize(1000).greyscale().normalize().sharpen().toBuffer();
    const result = await NodeTesseract.recognize(preprocessedImage, {
        lang: 'chi_sim',
        // psm: 3,
        // // oem: 1,
        // dpi: 120,
        oem: 1,
        psm: 3,
        // tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    });

    return result;
};

export async function recognizeImage(url: string): Promise<any> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });

        try {
            // Preprocess the image

            // const imageBuffer = await preprocessImage(response.data);
            const imageBuffer = Buffer.from(response.data, 'binary');
            // detectText(imageBuffer);
            // Detect text regions
            const SharpTexts = await SharpDetect(response.data);

            return SharpTexts;
        } catch (error) {
            console.error('Error processing image:', error);
        }
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
