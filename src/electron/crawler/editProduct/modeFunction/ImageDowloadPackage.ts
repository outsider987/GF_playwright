import { BrowserContext, Page } from 'playwright';
import { downloadImage, loadImage } from '../../utils/image';
import * as fs from 'fs';
import { exportPath } from '../../config/base';
import axios from 'axios';
import { config } from 'process';

export const startDownloadImageProcess = async (editPage: Page, context: BrowserContext) => {
    console.log('start download image process');
    const showMoreBtn = await editPage.$('#showMoreImg');
    const headerSelector = '#title';
    const titleElement = await editPage.waitForSelector(headerSelector);
    const titleValue = await titleElement.inputValue();
    const targetPath = `${exportPath.downloadImagePackage}/${titleValue}`;

    if (showMoreBtn && (await showMoreBtn.isVisible())) await showMoreBtn.click();
    const imageDivElements = await editPage.$$('.imgDivIn');
    const urls = [];

    for (const image of imageDivElements) {
        const imageElement = await image.$('img');
        const url = await imageElement.getAttribute('src');
        if (url) urls.push(url);
    }
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
    }

    const downloadPromises = urls.map((imageUrl, index) => downloadImage(imageUrl, index + 1, targetPath, true));

    await Promise.all(downloadPromises)
        .then((results) => {
            console.log(`Downloaded ${results.length} images:`);
            results.forEach((result) => console.log(`${result.url} saved as ${result.filename}`));
        })
        .catch((error) => {
            console.error('Error downloading images:', error);
        });
    // const images = await Promise.all(urls.map((url) => loadImage(url, 720)));

    console.log('end download image process');
};
