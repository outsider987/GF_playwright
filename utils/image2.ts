import cv, { Mat, Rect } from 'opencv-ts';
import crypto from 'crypto';
import { createCanvas, loadImage as htmlLoadImage } from 'canvas';
interface ImageType {
    url: string;
    data: any;
    height?: number;
    width?: number;
}

export function loadImage(url: string): Promise<ImageType> {
    return new Promise((resolve, reject) => {
        // image.crossOrigin = 'anonymous';
        htmlLoadImage(url)
            .then((image) => {
                const canvas = createCanvas(200, 200); // create a new canvas object
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
                reject(`Failed to load image: ${url}`);
            });
    });
}
function hashImage(image: ImageType): string {
    const hash = crypto.createHash('sha1');
    hash.update(image.data);
    return hash.digest('hex');
}

export async function removeSimilarImages(images: ImageType[]) {
    // const result: Mat = new cv.Mat();
    // const removedIndices: number[] = [];

    // for (let i = 0; i < images.length; i++) {
    //     const image1 = images[i];
    //     let isSimilar = false;

    //     for (let j = 0; j < i; j++) {
    //         const image2 = images[j];

    //         // Convert images to grayscale
    //         const grayImage1 = cv.matFromArray(image1.height, image1.width, cv.CV_8UC4,image1.data, );
    //         const grayImage2 = cv.matFromArray( image2.height, image2.width, cv.CV_8UC4,image2.data);
    //         cv.cvtColor(grayImage1, grayImage1, cv.COLOR_RGBA2GRAY);
    //         cv.cvtColor(grayImage2, grayImage2, cv.COLOR_RGBA2GRAY);

    //         // Calculate the structural similarity (SSIM) between the two images
    //         cv.matchTemplate(grayImage1, grayImage2, result, cv.TM_CCOEFF_NORMED);

    //         const maxVal = cv.minMaxLoc(result).maxVal;

    //         // Check if the similarity is over 80%
    //         if (maxVal > 0.8) {
    //           isSimilar = true;
    //           removedIndices.push(i);
    //           break;
    //         }

    //         // Free memory
    //         grayImage1.delete();
    //         grayImage2.delete();
    //     }
    // }

    // return result;

    // const uniqueImages: ImageType[] = [];
    // const removedIndices: number[] = [];
    // const imageHashes = new Map<string, number>();
    // let result: Mat = new cv.Mat();
    // for (let i = 0; i < images.length; i++) {
    //     const image = images[i];
    //     const hash = hashImage(image);

    //     if (imageHashes.has(hash)) {
    //         const similarIndex = imageHashes.get(hash);
    //         const similarityScore = await cv.matchTemplate(
    //             image.data,
    //             images[similarIndex].data,
    //             result,
    //             cv.TM_CCOEFF_NORMED,
    //         );
    //         const maxVal = cv.minMaxLoc(result).maxVal;
    //         if (maxVal > 0.9) {
    //             removedIndices.push(i);
    //             if (!removedIndices.includes(similarIndex)) {
    //                 removedIndices.push(similarIndex);
    //             }
    //         }
    //     } else {
    //         imageHashes.set(hash, i);
    //         uniqueImages.push(image);
    //     }
    // }

    // return { uniqueImages, removedIndices };

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

// // Load images from URLs
// const urls = [
//   'path/to/image1.jpg',
//   'path/to/image2.jpg',
//   'path/to/image3.jpg',
//   // Add more image URLs here
// ];

// const images = await Promise.all(urls.map(url => loadImage(url)));

// // Remove similar images and get their indices
// const removedIndices = await removeSimilarImages(images);

// // Log the indices of the removed images
// console.log(removedIndices);
