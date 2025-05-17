import { BrowserContext, Page } from 'playwright';
import { downloadImage } from '../../utils/image';
import * as fs from 'fs';
import { AliaRoute, exportPath } from '../../config/base';
import { app } from 'electron';
import path from 'path';
import { downloadState as downloadStateType } from '../../config/base';
import { getCurrentDoman } from '../filterHandle';

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
    // 1. CLICK "访 问" and WAIT for the new page (popup)
    const visitLinkSelector = '.source-url-info .input-group > div.input-group-addon:nth-of-type(2) a';

    // 2) Click + wait for the popup page:
    const [videoPage] = await Promise.all([context.waitForEvent('page'), editPage.click(visitLinkSelector)]);
    console.log('videoPage', videoPage);
    await videoPage.waitForLoadState('domcontentloaded');

    // 2. SELECT the <video> and EXTRACT its src
    const videoElm = await videoPage.waitForSelector('video.lib-video');
    const rawSrc = await videoElm.getAttribute('src');
    if (!rawSrc) throw new Error('Could not find video src!');
    const videoUrl = rawSrc.startsWith('http') ? rawSrc : `https:${rawSrc}`;

    // 3. FETCH & SAVE the video file
    const resp = await videoPage.request.get(videoUrl);
    if (!resp.ok()) throw new Error(`Video download failed: ${resp.status()}`);
    const buffer = await resp.body();

    const downloadDir = path.join(documentsPath, exportPath.downloadImagePackage, titleValue);
    const videoPath = path.join(downloadDir, 'video.mp4');
    fs.writeFileSync(videoPath, buffer);
    await videoPage.close();

    console.log(`✅ Video saved to ${videoPath}`);
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
