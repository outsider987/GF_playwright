import sharp from 'sharp';
import Tesseract from 'node-tesseract-ocr';
import fs from 'fs';

async function start() {
    const imageData = fs.readFileSync('temp/S__22937730.jpg');
    const preprocessedImage = await sharp(imageData).resize(1000).greyscale().normalize().sharpen().toBuffer();

    // Extract text using Tesseract.js with the chi_tra language data
    const result = await Tesseract.recognize(preprocessedImage, {
        lang: 'chi_tra',
        psm: 4,
        oem: 1,
        dpi: 150,

        // tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    });

    console.log(result);
}
start();
//I want these data to table format
