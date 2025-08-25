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

export async function setBarcode(editPage: Page, context: BrowserContext) {
    // New UI uses a span with text "访问"; keep legacy anchor as fallback
    // Try to extract the URL from the new DOM structure, fallback to legacy if needed
    // 1. Try to find the input[name="sourceUrl"] in the new UI
    let sourceUrlInput = await editPage.$('input[name="sourceUrl"]');
    let sourceUrl = null;
    if (sourceUrlInput) {
        sourceUrl = await sourceUrlInput.getAttribute('value');
    }

    // 2. If not found, fallback to legacy link click (old UI)
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

        // await handleGoToPage({ page: barCodePage, url: link, isignoreLoaded: true });

        const url = await barCodePage.url();
        const domain = new URL(url);
        const domainName = domain.hostname.replace('www.', '');
        switch (domainName) {
            case targetUrl.Alia:
                const spanSelector =
                    'div.offer-attr-item span.offer-attr-item-name:has-text("货号") + span.offer-attr-item-value';
                const sliderSelector = '#nc_1_n1z';

                await Sleep(2000);
                // await barCodePage.waitForLoadState('networkidle');
                await barCodePage.$(sliderSelector);
                const needDragSliderElement = await barCodePage.$(sliderSelector);
                if (needDragSliderElement && (await needDragSliderElement.isVisible())) {
                    let ispass = false;
                    while (!ispass) {
                        // const browser: Browser = await firefox.launch({
                        //     headless: false,
                        //     // args: ['--disable-features=site-per-process'],
                        // });
                        // const context = await browser.newContext();
                        // const fireFoxPage = await context.newPage();
                        // await fireFoxPage.goto(link);

                        const sliderBoxSelectoe = '#nc_1__scale_text';
                        const boxElement = await barCodePage.waitForSelector(sliderBoxSelectoe);
                        const sliderBoundingBox = await boxElement.boundingBox();
                        const sliderX = sliderBoundingBox.x + sliderBoundingBox.width / 2;
                        const sliderHandle = await barCodePage.locator(sliderSelector).first();
                        // needDragSliderElement.
                        await needDragSliderElement.hover();
                        await needDragSliderElement.dispatchEvent('mousedown', { button: 'left' });
                        await Sleep(1000);
                        await needDragSliderElement.dispatchEvent('mousemove', { button: 'left' });
                        await sliderHandle.dragTo(sliderHandle, { force: true, targetPosition: { x: sliderX, y: 0 } });
                        await Sleep(3000);
                        await needDragSliderElement.dispatchEvent('mouseup', { button: 'left' });

                        const cookies = await barCodePage.context().cookies();

                        const documentsPath = app ? app.getPath('documents') : './';
                        const cookiePath = path.join(documentsPath, exportPath.cookies);
                        if (!fs.existsSync(cookiePath)) fs.mkdirSync(cookiePath);
                        fs.writeFileSync(`${cookiePath}/aliasCookies.json`, JSON.stringify(cookies, null, 2));

                        if (barCodePage && (await barCodePage.isVisible('#nc_1_refresh1'))) {
                            const refreshElement = await barCodePage.$('#nc_1_refresh1');
                            if (refreshElement && (await refreshElement.isVisible())) {
                                await refreshElement?.click();
                                return;
                            }
                        } else {
                            ispass = true;
                            // const aliasCookies = JSON.parse(
                            //     fs.readFileSync(`${exportPath.cookies}/aliasCookies.json`, 'utf8'),
                            // );
                            // await context.addCookies(aliasCookies);
                            // await browser.close();
                            throw 'failer get barcode';
                        }
                    }
                }
                // await barCodePage.waitForLoadState('networkidle');

                // Robustly locate 货号 value using multiple selectors and XPath as fallback
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
            case targetUrl.socwung:
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
    const showMoreBtn = await editPage.$('#showMoreImg');
    if (showMoreBtn && (await showMoreBtn.isVisible())) await showMoreBtn.click();
    const checkBoxs = await editPage.$$('input[type="checkbox"][name="selectedImg"]');
    const imageDivElements = await editPage.$$('.imgDivIn');
    const deleteBtns = await editPage.$$('.attach-icons.pull-right.yiImg');
    const urls = [];

    // checked all images

    if (config.routineState.I.children.勾選所有圖片.value) {
        for (const checkBox of checkBoxs) {
            if (!(await checkBox.isChecked()) && (await checkBox.isVisible()) && !(await checkBox.isHidden())) {
                await checkBox.click();
            }
        }
    }

    // remove duplicate images
    if (config.routineState.I.children.移除相同圖片.value) {
        for (const image of imageDivElements) {
            const imageElement = await image.$('img');
            if (imageElement) {
                const url = await imageElement.getAttribute('src');
                if (url) urls.push(url);
            }
        }
        const images = await Promise.all(urls.map((url) => loadImage(url, 200)));
        const { removedIndices } = await removeSimilarImages(images);

        for (const index of removedIndices) {
            await deleteBtns[index].click();
        }
    }

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
