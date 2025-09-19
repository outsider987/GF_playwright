import { Browser, BrowserContext, Page, firefox } from 'playwright';
import { handleError, handleGoToPage } from '../utils/handler';
import { Sleep, convertToTraditionalChinese } from '../utils/utils';
import { loadImage, removeSimilarImages } from '../utils/image';
import {
    AliaRoute,
    globalState,
    defaultCode,
    exportPath,
    sensitiveWord,
    targetUrl,
    routineState,
} from '../config/base';
import moment from 'moment';
import { getCurrentDoman, getDuplicatedIndexs } from './filterHandle';
import * as fs from 'fs';
import { app } from 'electron';
import path from 'path';

type configType = { globalState: typeof globalState; routineState: typeof routineState };

export async function startProcessCodeFlow(
    needRunCode: string[],
    editPage: Page,
    context: BrowserContext,
    SKU: string,
    config: configType,
) {
    console.log(`routineState ${JSON.stringify(config.routineState)}`);
    for (const code of needRunCode) {
        switch (code) {
            case 'T':
                if (!config.routineState.T.enable) continue;
                await handleError(async () => await translateTitle(editPage), { code: 'T', config });
                SKU += 'T';
                break;
            // case 'C':
            //     if (!config.routineState.C.enable) continue;
            //     await handleError(async () => await setConstant(editPage, config), { code: 'C', config });
            //     SKU += 'C';
            //     break;
            case 'B':
                if (!config.routineState.B.enable) continue;
                await handleError(async () => await setBarcode(editPage, context), { code: 'B', config });
                SKU += 'B';
                break;
            // case 'M':
            //     if (!config.routineState.M.enable) continue;
            //     await handleError(async () => await setMoney(editPage, config), { code: 'M', config });
            //     SKU += 'M';
            //     break;
            case 'F':
                if (!config.routineState.F.enable) continue;
                SKU += 'F';
                await handleError(async () => await setNameTitle(editPage, SKU, config), { code: 'F', config });
                break;
            case 'S':
                if (!config.routineState.S.enable) continue;
                await handleError(async () => await setSizeAndTranslate(editPage, context, config), {
                    code: 'S',
                    config,
                });
                SKU += 'S';
                break;
            case 'I':
                if (!config.routineState.I.enable) continue;
                await handleError(async () => await removeDuplicateImageAndEnable(editPage, config), {
                    code: 'I',
                    config,
                });
                SKU += 'I';
                break;
            // case 'O':
            //     if (!config.routineState.O.enable) continue;
            //     await handleError(async () => await SEOAutoFillIn(editPage), { code: 'O', config });
            //     SKU += 'O';
            //     break;

            default:
                break;
        }
    }
    return SKU;
}

export async function translateTitle(editPage: Page) {
    const titleInput = editPage.locator('input#title:visible');
    await titleInput.waitFor();
    const titleValue = (await titleInput.inputValue()).replace(/【.*?】/g, '');

    const newTCValue = await convertToTraditionalChinese(titleValue);

    await titleInput.fill(newTCValue);
    console.log('end translate title');

    // Update color option editor to new DOM structure
    const optionItems = editPage.locator('.options-module label.d-checkbox .theme-value-edit');
    const optionCount = await optionItems.count();
    for (let i = 0; i < optionCount; i++) {
        const item = optionItems.nth(i);
        const textElement = item.locator('.theme-value-text');
        const originalText = (await textElement.innerText()).trim();

        const editButton = item.locator('.btn-edit');
        if (!(await editButton.isVisible())) continue;
        await editButton.click();

        const inputElement = item.locator('input.edit-inp');
        await inputElement.waitFor({ state: 'visible' });
        const newColorTextValue = await convertToTraditionalChinese(originalText);
        await inputElement.fill(newColorTextValue);

        const saveButton = item.locator('.btn-save');
        await saveButton.click();
        // Best-effort wait for input to hide back after save
        await inputElement.waitFor({ state: 'hidden' }).catch(() => {});
    }
}

export async function setConstant(editPage: Page, config: configType) {
    const defaultInventory = config.routineState.C.children.庫存.value;
    const defaultWeight = config.routineState.C.children.重量.value;

    const domainName = await getCurrentDoman(editPage);

    const tBody = await editPage.waitForSelector('#shopifySkuAdd');

    const inventoryInputElementS = await editPage.$$('[data-name="inventory"]');
    const weightInputElementS = await editPage.$$('[data-name="weight"]');

    for (const inventory of inventoryInputElementS) {
        const inputElement = await inventory.$('input');
        if (inputElement) await inputElement.fill(defaultInventory);
    }

    if (!AliaRoute.includes(domainName)) {
        for (const weight of weightInputElementS) {
            const inputElement = await weight.$('input');
            if (inputElement) await inputElement.fill(defaultWeight);
        }
    }
}

// Pseudocode plan for robust slider detection and handling:
// 1. After opening the barCodePage, check for the presence and visibility of the slider (Aliyun/Alibaba anti-bot).
// 2. If present, try to robustly detect when the slider is ready (wait for selector, check bounding box, etc).
// 3. Use Playwright's drag-and-drop or mouse events to move the slider all the way to the right.
// 4. Add retries and error handling for common failures (slider not visible, bounding box null, drag fails, etc).
// 5. If slider is not present, proceed as normal.
// 6. After passing the slider, continue to extract the barcode as before.

export async function setBarcode(editPage: Page, context: BrowserContext) {
    // Try to find the input[name="sourceUrl"] in the new UI
    let sourceUrlInput = await editPage.$('input[name="sourceUrl"]');
    let sourceUrl = null;
    if (sourceUrlInput) {
        sourceUrl = await sourceUrlInput.getAttribute('value');
    }

    // Fallback to legacy link click (old UI)
    const legacyLinkSelector = 'a[href="javascript:"][onclick="jumpSourceUrl(this);"] > span';
    let linkElement = await editPage.$('css=span.suffix >> text=访问');
    if (!linkElement) linkElement = await editPage.$('span.suffix span:has-text("访问")');
    if (!linkElement) linkElement = await editPage.$(legacyLinkSelector);
    if (!linkElement) throw new Error('Unable to locate source link (访问) control');

    // Click the link and wait for the new tab to be fully loaded
    const [barCodePage] = await Promise.all([context.waitForEvent('page'), linkElement.click()]);
    await barCodePage.waitForLoadState('domcontentloaded');

    try {
        const barcodeInputElementS = await editPage.locator('input[name="barcode"]:visible');
        const count = await barcodeInputElementS.count();
        const barcodeInputElementSArray = [];
        for (let i = 0; i < count; i++) {
            barcodeInputElementSArray.push(barcodeInputElementS.nth(i));
        }

        const url = await barCodePage.url();
        const domain = new URL(url);
        const domainName = domain.hostname.replace('www.', '');

        switch (domainName) {
            case targetUrl.Alia: {
                const spanSelector =
                    'div.offer-attr-item span.offer-attr-item-name:has-text("货号") + span.offer-attr-item-value';
                const sliderSelector = '#nc_1_n1z';
                const sliderBoxSelector = '#nc_1__scale_text';

                // Wait for possible slider to appear (max 10s)
                let sliderAppeared = false;
                let sliderHandle = null;
                let sliderBox = null;
                for (let attempt = 0; attempt < 10; attempt++) {
                    sliderHandle = await barCodePage.$(sliderSelector);
                    if (sliderHandle && await sliderHandle.isVisible()) {
                        sliderBox = await barCodePage.$(sliderBoxSelector);
                        if (sliderBox && await sliderBox.isVisible()) {
                            sliderAppeared = true;
                            break;
                        }
                    }
                    await Sleep(1000);
                }

                if (sliderAppeared && sliderHandle && sliderBox) {
                    // Try up to 3 times to pass the slider
                    let sliderPassed = false;
                    for (let tryCount = 0; tryCount < 3 && !sliderPassed; tryCount++) {
                        try {
                            // Get bounding box for slider bar and handle
                            const box = await sliderBox.boundingBox();
                            const handleBox = await sliderHandle.boundingBox();
                            if (!box || !handleBox) throw new Error('Slider bounding box not found');

                            // Calculate drag target: move handle from its center to the far right of the bar
                            const startX = handleBox.x + handleBox.width / 2;
                            const startY = handleBox.y + handleBox.height / 2;
                            const endX = box.x + box.width - handleBox.width / 2 - 2; // -2 for safety
                            const endY = startY;

                            // Use Playwright mouse API for more reliable drag
                            const page = barCodePage;
                            await page.mouse.move(startX, startY);
                            await page.mouse.down();
                            await Sleep(300);
                            await page.mouse.move(endX, endY, { steps: 25 });
                            await Sleep(500);
                            await page.mouse.up();

                            // Wait for slider to disappear (max 5s)
                            let sliderGone = false;
                            for (let wait = 0; wait < 10; wait++) {
                                const stillThere = await page.$(sliderSelector);
                                if (!stillThere || !(await stillThere.isVisible())) {
                                    sliderGone = true;
                                    break;
                                }
                                await Sleep(500);
                            }
                            if (sliderGone) {
                                sliderPassed = true;
                                break;
                            } else {
                                // If there's a refresh button, click it and retry
                                const refreshBtn = await page.$('#nc_1_refresh1');
                                if (refreshBtn && await refreshBtn.isVisible()) {
                                    await refreshBtn.click();
                                    await Sleep(2000);
                                }
                            }
                        } catch (err) {
                            // If drag fails, try refresh and retry
                            const refreshBtn = await barCodePage.$('#nc_1_refresh1');
                            if (refreshBtn && await refreshBtn.isVisible()) {
                                await refreshBtn.click();
                                await Sleep(2000);
                            }
                        }
                    }
                    // If still not passed, throw error
                    if (!sliderPassed) {
                        throw new Error('Failed to pass slider verification after multiple attempts');
                    }
                }

                // Now, try to extract the barcode as before
                const aliaSelectors = [
                    spanSelector,
                    'tr.ant-descriptions-row th.ant-descriptions-item-label:has-text("货号") + td.ant-descriptions-item-content .field-value',
                    'th:has-text("货号") + td .field-value',
                ];
                let targetElement = null;
                for (const sel of aliaSelectors) {
                    const el = await barCodePage.$(sel);
                    if (el) {
                        targetElement = el;
                        break;
                    }
                }
                if (!targetElement) {
                    const xpathExpr =
                        '//tr[contains(@class, "ant-descriptions-row")]//th[contains(@class, "ant-descriptions-item-label")]//span[normalize-space()="货号"]/ancestor::th/following-sibling::td[1]//*[contains(@class, "field-value")]' +
                        '|//th[./span[normalize-space()="货号"]]/following-sibling::td[1]//span';
                    const els = await barCodePage.$$(`xpath=${xpathExpr}`);
                    if (els.length > 0) targetElement = els[0];
                }
                if (!targetElement) throw new Error('Unable to locate 货号 on source page');

                let barcodeAlia = (await targetElement.innerText()).trim();
                barcodeAlia = barcodeAlia.replace(/\D/g, '');
                if (!barcodeAlia) throw new Error('barcode is empty');

                console.log(barcodeAlia);

                for (const barcodeInput of barcodeInputElementSArray) {
                    await barcodeInput.fill(barcodeAlia);
                }
                const cookies = await barCodePage.context().cookies();
                // fs.writeFileSync(`${exportPath.cookies}/aliasCookies.json`, JSON.stringify(cookies, null, 2));
                await barCodePage.close();
                break;
            }
            case targetUrl.socwung: {
                await Sleep(3000);
                await editPage.waitForSelector('[data-name="barcode"]');
                const barcodeElement = await barCodePage.waitForSelector('text=货号:');
                const barcode = await (await barcodeElement.innerText()).replace(/\D/g, '');
                console.log(`barcode: ${barcode}`);
                for (const barcodeInput of barcodeInputElementSArray) {
                    await barcodeInput.fill(barcode);
                }
                await barCodePage.close();
                break;
            }
            default:
                break;
        }
    } catch (error) {
        console.log(`set barcode error: ${error}`);
        const pages = await context.pages();
        await pages[pages.length - 1].close();
        throw error;
    }
}

export async function setMoney(editPage: Page, config: configType) {
    console.log('［Ｍ］　start set money');

    const tBody = await editPage.waitForSelector('[data-name="price"]');
    const priceInputElementS = await editPage.$$('[data-name="price"]');
    const msrpInputElementS = await editPage.$$('[data-name="msrp"]');
    // const link = await editPage.$eval(linkInpuSelector, (input: HTMLInputElement) => input.value);
    let newValue = '';
    const { 匯率, 另加, 運費 } = config.routineState.M.children;
    const dollarRate = parseFloat(匯率.value);
    for (const [index, price] of priceInputElementS.entries()) {
        const inputElement = await price.$('input');

        if (inputElement) {
            const msrpInputElement = await msrpInputElementS[index - 1].$('input');
            const baseValue = parseFloat(await inputElement?.inputValue());
            const value =
                Math.round(((baseValue + parseFloat(運費.value)) * dollarRate * 2 + parseFloat(另加.value)) / 10) * 10;
            newValue = String(value);

            await inputElement.fill(newValue);
            if (msrpInputElement) await msrpInputElement.fill(newValue);
        }
    }
    // for (const msrp of msrpInputElementS) {
    //     const inputElement = await msrp.$('input');
    //     if (inputElement) {
    //         await inputElement.fill(newValue);
    //     }
    // }
}

export async function setNameTitle(editPage: Page, SKU: string, config: configType) {
    const skuInputElementS = await editPage.locator('input[name="sku"]:visible');
    const count = await skuInputElementS.count();
    const skuInputElementSArray = [];
    for (let i = 0; i < count; i++) {
        skuInputElementSArray.push(skuInputElementS.nth(i));
    }
    let newValue = '';
    let newSKU = '【';

    const { children } = config.routineState.F;

    newSKU += children.前墬.value;
    if (children.SKU取代標題.value) {
        const barcodeInputElementS = await editPage.locator('input[name="barcode"]:visible');
        const count = await barcodeInputElementS.count();
        const barcodeInputElementSArray = [];
        for (let i = 0; i < count; i++) {
            barcodeInputElementSArray.push(barcodeInputElementS.nth(i));
        }
        for (const barcodeInput of barcodeInputElementSArray) {
            newSKU += `${await barcodeInput.inputValue()}`;
            break;
        }
    } else if (children.使用機器人編號.value) {
        newSKU += SKU;
        // Get the current date
    }

    if (children.使用順序號.value) {
        const currentDate = moment();
        const formattedMonth = currentDate.format('MM');
        const currentWeek = Math.ceil(currentDate.date() / 7);
        newSKU += formattedMonth;
        newSKU += currentWeek;
        const paddedNumber = config.routineState.F.children.號碼.value.toString().padStart(2, '0');
        newSKU += paddedNumber;
    }

    newSKU += children.後墬.value;
    newSKU += '】';

    const titleInput = editPage.locator('input#title:visible');
    const titleValue = await titleInput.inputValue();

    if (!titleValue.match(/【[^【】]+】/g)) newValue = newSKU + titleValue.replace(/【|】/g, '');
    else newValue = titleValue.replace(/【[^【】]+】/g, newSKU);
    // set title vlaue
    await titleInput.fill(newValue);

    for (const sku of skuInputElementSArray) {
        await sku.fill(newSKU.replace(/【|】/g, ''));
    }

    config.routineState.F.children.號碼.value++;
}

export async function setSizeAndTranslate(editPage: Page, context: BrowserContext, config: configType) {
    const sizeFrameSelector = '#cke_3_contents';
    const contentElement = await editPage.waitForSelector(sizeFrameSelector);

    const iframeElement = await contentElement.waitForSelector('iframe');
    await iframeElement.waitForElementState('visible');

    const iframe = await iframeElement.contentFrame();
    await iframe.waitForLoadState('domcontentloaded');
    const bodyElement = await iframe.$('body');

    const newTCinnerHtmlStr = await convertToTraditionalChinese(await bodyElement?.innerHTML());
    let finalStr = '';

    const traditionalRegex = /[\u4e00-\u9fff]+/g;
    const templateRegex = new RegExp(
        `<div style="text-align: center;"><span>${config.routineState.S.children.前墬.value}<\/span><\/div>`,
    );
    const { children } = config.routineState.S;

    if (traditionalRegex.test(newTCinnerHtmlStr) && !templateRegex.test(newTCinnerHtmlStr) && children.移除圖片.value) {
        finalStr = newTCinnerHtmlStr.replace(/<img[^>]*>/g, '');
    } else if (children.移除文字.value) finalStr = newTCinnerHtmlStr;

    const result = `
    <div style="text-align: center;">
        <span>${config.routineState.S.children.前墬.value}</span>
    </div>
    ${finalStr}
    <div style="text-align: center;">
        <span>${config.routineState.S.children.後墬.value}</span>
    </div>
 `;
    if (!templateRegex.test(newTCinnerHtmlStr))
        await iframe.evaluate((html: string) => {
            document.body.innerHTML = html;
        }, result);
    console.log('newTCValue:', result);
}

export async function removeDuplicateImageAndEnable(editPage: Page, config: configType) {
    console.log('［I］ start process image');
    // Try to click the "查看更多" button if present (new UI)
    const showMoreBtn = await editPage.$('span.link.view-more:has-text("查看更多")');
    if (showMoreBtn && (await showMoreBtn.isVisible())) {
        await showMoreBtn.click();
    }
    // New UI structure: .img-list contains .single-image.img-item entries
    const imageItems = editPage.locator('.img-list .single-image.img-item');
    const itemCount = await imageItems.count();

    // checked all images
    if (config.routineState.I.children.勾選所有圖片.value) {
        const checkboxes = imageItems.locator('label.image-checkbox input.ant-checkbox-input');
        const cbCount = await checkboxes.count();
        for (let i = 0; i < cbCount; i++) {
            const cb = checkboxes.nth(i);
            if (!(await cb.isChecked())) {
                await cb.check({ force: true });
            }
        }
    }

    // remove duplicate images
    // if (config.routineState.I.children.移除相同圖片.value) {
    //     const imageUrlByItemIndex: Array<{ itemIndex: number; url: string }> = [];
    //     for (let i = 0; i < itemCount; i++) {
    //         const imageLocator = imageItems.nth(i).locator('img.img-css');
    //         const src = await imageLocator.getAttribute('src');
    //         if (src && src.length > 0) imageUrlByItemIndex.push({ itemIndex: i, url: src });
    //     }
    //     const images = await Promise.all(imageUrlByItemIndex.map((entry) => loadImage(entry.url, 200)));
    //     const { removedIndices } = await removeSimilarImages(images);

    //     for (const removed of removedIndices) {
    //         const actualItemIndex = imageUrlByItemIndex[removed]?.itemIndex;
    //         if (actualItemIndex === undefined) continue;
    //         const deleteBtn = imageItems.nth(actualItemIndex).locator('a.iconfont.icon_delete');
    //         if (await deleteBtn.count()) {
    //             await deleteBtn.first().click();
    //         }
    //     }
    // }

    console.log('end process image');
}

export async function SEOAutoFillIn(editPage: Page) {
    console.log('［O］ start SEO autofill in');

    const seoSpanElm = await editPage.waitForSelector('#seoSpan');
    await seoSpanElm.click();

    const headerSelector = '#title';
    const titleElement = await editPage.waitForSelector(headerSelector);
    const titleValue = await titleElement.inputValue();

    const seoHeaderSelector = '#seoTitle';

    const seoTitleElement = await editPage.waitForSelector(seoHeaderSelector);
    await seoTitleElement.fill(titleValue);

    const URLInputElm = await editPage.waitForSelector('#shopifyApiName');
    const code = titleValue.match(/【[^【】]+】/g);
    await URLInputElm.fill(code[0].replace(/【|】/g, ''));
}
