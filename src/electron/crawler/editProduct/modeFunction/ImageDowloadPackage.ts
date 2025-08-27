import { BrowserContext, Page, Locator } from 'playwright';
import { downloadImage } from '../../utils/image';
import * as fs from 'fs';
import { AliaRoute, exportPath } from '../../config/base';
import { app } from 'electron';
import path from 'path';
import { downloadState as downloadStateType } from '../../config/base';
import { getCurrentDoman } from '../filterHandle';

// Ensure filename-safe and non-empty values
const sanitizeForFileName = (raw: string): string => {
    const trimmed = (raw || '').trim();
    // Remove reserved characters and collapse whitespace
    const sanitized = trimmed
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    return sanitized;
};

// Wait until the input's value is non-empty, trying for up to timeoutMs
const waitForNonEmptyInputValue = async (
    page: Page,
    locator: Locator,
    timeoutMs: number = 5000,
): Promise<string> => {
    const start = Date.now();
    let value = '';
    while (Date.now() - start < timeoutMs) {
        try {
            await locator.waitFor({ state: 'visible', timeout: Math.max(200, timeoutMs - (Date.now() - start)) });
            value = (await locator.inputValue())?.trim();
            if (value) return value;
        } catch {}
        await page.waitForTimeout(150);
    }
    return (value || '').trim();
};

export const startDownloadImageProcess = async (
    editPage: Page,
    context: BrowserContext,
    downloadState: typeof downloadStateType,
) => {
    console.log('start download image process');

    let titleValue = 'Edit';
    await editPage.waitForLoadState('domcontentloaded');
    try {
        await editPage.waitForLoadState('networkidle', { timeout: 2000 });
    } catch {}
    const showMoreBtn = await editPage.$('span.link.view-more:has-text("查看更多")');

    // Resolve titleValue robustly
    try {
        if (downloadState.isSEOCode.enable) {
            try {
                const seoSpanElm = await editPage.waitForSelector('#seoSpan', { timeout: 5000 });
                await seoSpanElm.click();
            } catch {}

            // Primary SEO input
            const seoPrimary = editPage.locator('#shopifyApiName');
            titleValue = await waitForNonEmptyInputValue(editPage, seoPrimary, 4000);

            // Fallback SEO input
            if (!titleValue) {
                const seoAlt = editPage.locator('#seoTitle');
                titleValue = await waitForNonEmptyInputValue(editPage, seoAlt, 3000);
            }
        } else {
            // Primary Title input
            const titlePrimary = editPage.locator('input#title:visible');
            titleValue = await waitForNonEmptyInputValue(editPage, titlePrimary, 5000);

            // Fallback Title input
            if (!titleValue) {
                const titleAlt = editPage.locator('input[name="title"]');
                titleValue = await waitForNonEmptyInputValue(editPage, titleAlt, 3000);
            }
        }

        // Last-resort: scrape from DOM text if still empty
        if (!titleValue) {
            titleValue = await editPage.evaluate(() => {
                const inputSelectors = ['#shopifyApiName', '#seoTitle', 'input#title', 'input[name="title"]'];
                for (const sel of inputSelectors) {
                    const el = document.querySelector(sel) as HTMLInputElement | null;
                    const val = el?.value?.trim();
                    if (val) return val;
                }
                const textSelectors = ['.product-title', '.edit-title', 'h1', 'h2', 'title'];
                for (const sel of textSelectors) {
                    const el = document.querySelector(sel);
                    const txt = (el?.textContent || '').trim();
                    if (txt) return txt;
                }
                return '';
            });
        }
    } catch (err) {
        console.warn('Failed to resolve title from DOM, using fallback.', err);
    }

    titleValue = sanitizeForFileName(titleValue);
    if (!titleValue) titleValue = `Edit-${Date.now()}`;

    const targetPath = `${exportPath.downloadImagePackage}/${titleValue}`;

    if (showMoreBtn && (await showMoreBtn.isVisible())) await showMoreBtn.click();
    // New UI: images are under .img-list as <img class="img-css"> inside each .single-image.img-item
    // Fallback to legacy .imgDivIn if the new structure is not present
    const urls: string[] = [];
    let newUiDetected = false;
    try {
        await editPage.waitForSelector('.img-list .single-image.img-item img.img-css', { timeout: 5000 });
        newUiDetected = true;
    } catch {}

    if (newUiDetected) {
        const imageElements = await editPage.$$('.img-list .single-image.img-item img.img-css');
        for (const imageElement of imageElements) {
            const src = await imageElement.getAttribute('src');
            if (src) urls.push(src.startsWith('http') ? src : `https:${src}`);
        }
    } else {
        await editPage.waitForSelector('.imgDivIn');
        const imageDivElements = await editPage.$$('.imgDivIn');
        for (const image of imageDivElements) {
            const imageElement = await image.$('img');
            const url = await imageElement?.getAttribute('src');
            if (url) urls.push(url.startsWith('http') ? url : `https:${url}`);
        }
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
    // 1. CLICK "访问" and WAIT for the new page (popup) - support new and legacy UI
    // let linkElement = await editPage.$('css=span.suffix >> text=访问');
    // if (!linkElement) linkElement = await editPage.$('span.suffix span:has-text("访问")');
    // if (!linkElement)
    //     linkElement = await editPage.$('.source-url-info .input-group > div.input-group-addon:nth-of-type(2) a');
    // if (!linkElement)
    //     linkElement = await editPage.$('a[href="javascript:"][onclick="jumpSourceUrl(this);"] > span');
    // if (!linkElement) throw new Error('Unable to locate source link (访问) control');

    // 2) Click + wait for the popup page:
    // const [videoPage] = await Promise.all([context.waitForEvent('page'), linkElement.click()]);
    // console.log('videoPage', videoPage);
    // await videoPage.waitForLoadState('domcontentloaded');

    // // 2. SELECT the <video> and EXTRACT its src
    // const videoElm = await videoPage.waitForSelector('video.lib-video');
    // const rawSrc = await videoElm.getAttribute('src');
    // if (!rawSrc) throw new Error('Could not find video src!');
    // const videoUrl = rawSrc.startsWith('http') ? rawSrc : `https:${rawSrc}`;

    // // 3. FETCH & SAVE the video file
    // const resp = await videoPage.request.get(videoUrl);
    // if (!resp.ok()) throw new Error(`Video download failed: ${resp.status()}`);
    // const buffer = await resp.body();

    // const downloadDir = path.join(documentsPath, exportPath.downloadImagePackage, titleValue);
    // const videoPath = path.join(downloadDir, 'video.mp4');
    // fs.writeFileSync(videoPath, buffer);
    // await videoPage.close();

    // console.log(`✅ Video saved to ${videoPath}`);
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
