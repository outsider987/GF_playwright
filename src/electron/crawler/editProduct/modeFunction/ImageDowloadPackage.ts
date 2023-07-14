import { BrowserContext, Page } from 'playwright';
import { downloadImage } from '../../utils/image';
import * as fs from 'fs';
import { exportPath } from '../../config/base';
import { app } from 'electron';
import path from 'path';
import { downloadState as downloadStateType } from '../../config/base';

export const startDownloadImageProcess = async (
    editPage: Page,
    context: BrowserContext,
    downloadState: typeof downloadStateType,
) => {
    console.log('start download image process');

    let titleValue = 'Edit';
    const showMoreBtn = await editPage.$('#showMoreImg');

    // here is change title value
    if (downloadState.isSEOCode.enable) {
        const seoSpanElm = await editPage.waitForSelector('#seoSpan');
        await seoSpanElm.click();

        const URLInputElm = await editPage.waitForSelector('#shopifyApiName');
        titleValue = await URLInputElm.inputValue();
    } else {
        const headerSelector = '#title';
        const titleElement = await editPage.waitForSelector(headerSelector);
        titleValue = await titleElement.inputValue();
    }

    const targetPath = `${exportPath.downloadImagePackage}/${titleValue}`;

    if (showMoreBtn && (await showMoreBtn.isVisible())) await showMoreBtn.click();
    await editPage.waitForSelector('.imgDivIn');
    const imageDivElements = await editPage.$$('.imgDivIn');
    const urls = [];

    for (const image of imageDivElements) {
        const imageElement = await image.$('img');
        const url = await imageElement.getAttribute('src');
        if (url) urls.push(url);
    }
    const documentsPath = app ? app.getPath('documents') : './';

    const dirPath = path.join(documentsPath, exportPath.downloadImagePackage);
    const filePath = path.join(dirPath, titleValue);
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
    }

    const downloadPromises = urls.map((imageUrl, index) =>
        downloadImage(imageUrl, index + 1, filePath, downloadState.isResize.enable),
    );

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
