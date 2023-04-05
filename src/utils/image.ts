import * as cv from 'opencv-ts';

// Define a function to load an image from a URL
async function loadImageFromUrl(url: string): Promise<cv.Mat> {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
    });
    const data = Buffer.from(response.data, 'binary');
    const image = cv.imdecode(data);
    return image;
}

// Define a function to calculate the similarity between two images
function calculateImageSimilarity(image1: cv.Mat, image2: cv.Mat): number {
    const grayImage1 = image1.cvtColor(cv.COLOR_BGR2GRAY);
    const grayImage2 = image2.cvtColor(cv.COLOR_BGR2GRAY);
    const ssim = cv.matchTemplate(grayImage1, grayImage2, cv.TM_CCOEFF_NORMED);
    return ssim.getDataAsArray()[0][0];
}
