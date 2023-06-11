import { Browser, BrowserContext, Page, firefox } from 'playwright';
import { handleError, handleGoToPage } from '../utils/handler';
import { Sleep, convertToTraditionalChinese } from '../utils/utils';
import { loadImage, removeSimilarImages, recognizeImage } from '../utils/image';
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
            case 'C':
                if (!config.routineState.C.enable) continue;
                await handleError(async () => await setConstant(editPage, config), { code: 'C', config });
                SKU += 'C';
                break;
            case 'B':
                if (!config.routineState.B.enable) continue;
                await handleError(async () => await setBarcode(editPage, context), { code: 'B', config });
                SKU += 'B';
                break;
            case 'M':
                if (!config.routineState.M.enable) continue;
                await handleError(async () => await setMoney(editPage, config), { code: 'M', config });
                SKU += 'M';
                break;
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
                await handleError(async () => await removeDuplicateImageAndEnable(editPage, config), { code: 'I', config });
                SKU += 'I';
                break;
            case 'O':
                if (!config.routineState.O.enable) continue;
                await handleError(async () => await SEOAutoFillIn(editPage), { code: 'O', config });
                SKU += 'O';
                break;

            default:
                break;
        }
    }
    return SKU;
}

export async function translateTitle(editPage: Page) {
    const headerSelector = '#title';
    const titleElement = await editPage.waitForSelector(headerSelector);
    const titleValue = (await titleElement?.inputValue()).replace(/【.*?】/g, '');

    const newTCValue = await convertToTraditionalChinese(titleValue);

    await titleElement.fill(newTCValue);
    console.log('end translate title');

    const colorSelector = '.change-box-out.changeBoxOut';
    const colorElements = await editPage.$$(colorSelector);
    for (const color of colorElements) {
        const editElement = await color.$('.change-box.changeBox');
        await editElement?.click();
        const inputElement = await editElement.$('input');

        const value = await inputElement?.inputValue();
        const newColorTextValue = await convertToTraditionalChinese(value);
        await inputElement?.fill(newColorTextValue);
        const saveElement = await editElement.$('.attach-icons.md-18.icon-save.btnSave');
        await saveElement?.click();
    }
}

export async function setConstant(editPage: Page, config: configType) {
    const defaultMSRP = config.routineState.C.children.MSRP.value;
    const defaultInventory = config.routineState.C.children.庫存.value;
    const defaultWeight = config.routineState.C.children.重量.value;

    const domainName = await getCurrentDoman(editPage);

    const tBody = await editPage.waitForSelector('#shopifySkuAdd');
    const msrpInputElementS = await editPage.$$('[data-name="msrp"]');
    const inventoryInputElementS = await editPage.$$('[data-name="inventory"]');
    const weightInputElementS = await editPage.$$('[data-name="weight"]');

    for (const msrp of msrpInputElementS) {
        const inputElement = await msrp.$('input');
        if (inputElement) await inputElement.fill(defaultMSRP);
    }
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
    const linkClickSelector = 'a[href="javascript:"][onclick="jumpSourceUrl(this);"] > span';
    const linkInpuSelector = '#sourceUrl0';
    const barcodeLinkInput = await editPage.waitForSelector(linkInpuSelector);
    await editPage.waitForSelector(linkClickSelector);
    const linkElement = await editPage.$(linkClickSelector);
    await linkElement.click();
    const barCodePage = await context.waitForEvent('page');
    try {
        // const barCodePage = await context.newPage();
        // await context.waitForEvent('page');
        const barcodeInputElementS = await editPage.$$('[data-name="barcode"]');
        const link = await editPage.$eval(linkInpuSelector, (input: HTMLInputElement) => input.value);

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

                const targetElement = await barCodePage.waitForSelector(spanSelector);
                const barcodeAlia = await targetElement.innerHTML();
                if (!barcodeAlia) throw new Error('barcode is empty');

                console.log(barcodeAlia);
                for (const barcodeInput of barcodeInputElementS) {
                    const inputElement = await barcodeInput.$('input');
                    if (inputElement) await inputElement.fill(barcodeAlia);
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
                for (const barcodeInput of barcodeInputElementS) {
                    const inputElement = await barcodeInput.$('input');
                    if (inputElement) await inputElement.fill(barcode);
                }
                await barCodePage.close();
                break;
            default:
                break;
        }
    } catch (error) {
        console.log(`set barcode error: ${error}`);
        const pages = await context.pages();
        await barCodePage.close();

        throw error;
    }
}

export async function setMoney(editPage: Page, config: configType) {
    console.log('［Ｍ］　start set money');

    const tBody = await editPage.waitForSelector('[data-name="price"]');
    const priceInputElementS = await editPage.$$('[data-name="price"]');
    // const link = await editPage.$eval(linkInpuSelector, (input: HTMLInputElement) => input.value);

    const { 匯率, 另加, 運費 } = config.routineState.M.children;
    const dollarRate = parseFloat(匯率.value);
    for (const price of priceInputElementS) {
        const inputElement = await price.$('input');
        const value = Math.round(parseInt(await inputElement?.inputValue()));
        if (inputElement)
            await inputElement.fill(String((value + parseFloat(運費.value)) * dollarRate * 2 + parseFloat(另加.value)));
    }
}

export async function setNameTitle(editPage: Page, SKU: string, config: configType) {
    const skuInputElementS = await editPage.$$('[data-name="sku"]');
    const domainName = await getCurrentDoman(editPage);
    let newValue = '';
    let newSKU = '【';

    const { children } = config.routineState.F;

    newSKU += children.前墬.value;
    if (children.SKU取代標題.value) {
        const barcodeInputElementS = await editPage.$$('[data-name="barcode"]');
        for (const barcodeInput of barcodeInputElementS) {
            const inputElement = await barcodeInput.$('input');
            if (inputElement) {
                newSKU += `${await inputElement.inputValue()}`;
                break;
            }
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

    const headerSelector = '#title';
    const titleElement = await editPage.waitForSelector(headerSelector);
    const titleValue = await titleElement.inputValue();

    if (!titleValue.match(/【[^【】]+】/g)) newValue = newSKU + titleValue.replace(/【|】/g, '');
    else newValue = titleValue.replace(/【[^【】]+】/g, newSKU);
    // set title vlaue
    await titleElement.fill(newValue);

    for (const sku of skuInputElementS) {
        const inputElement = await sku.$('input');
        if (inputElement) await inputElement.fill(newSKU.replace(/【|】/g, ''));
    }
    config.routineState.F.children.號碼.value++;
}

export async function setSizeAndTranslate(editPage: Page, context: BrowserContext, config: configType) {
    const sizeFrameSelector = '#cke_1_contents';
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

    if (
        traditionalRegex.test(newTCinnerHtmlStr) &&
        !templateRegex.test(newTCinnerHtmlStr) &&
        children.移除圖片.value
    ) {
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

export async function SEOAutoFillIn(editPage: Page,) {
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
