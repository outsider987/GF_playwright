import { Browser, BrowserContext, Page } from 'playwright';
import { handleGoToPage } from '../utils/handler';
import { Sleep, convertToTraditionalChinese } from '../utils/utils';
import { loadImage, removeSimilarImages } from '../utils/image2';
import { config as Config, defaultCode, targetUrl } from '../config/base';
import moment from 'moment';
import { getCurrentDoman } from './filterHandle';

export async function startProcessCodeFlow(
    needRunCode: string[],
    editPage: Page,
    context: BrowserContext,
    SKU: string,
    config: any,
) {
    for (const code of needRunCode) {
        switch (code) {
            case 'T':
                await translateTitle(editPage);
                SKU += 'T';
                break;
            case 'C':
                await setConstant(editPage);
                SKU += 'C';
                break;
            case 'B':
                await setBarcode(editPage, context);
                SKU += 'B';
                break;
            case 'M':
                await setMoney(editPage);
                SKU += 'M';
                break;
            case 'F':
                SKU += 'F';
                await setNameTitle(editPage, SKU, config);
                break;
            case 'S':
                await setSizeAndTranslate(editPage);
                SKU += 'S';
                break;
            case 'I':
                await processImage(editPage);
                SKU += 'I';
                break;

            default:
                break;
        }
    }
    return SKU;
}

export async function translateTitle(editPage: Page) {
    try {
        console.log('start translate title');
        const headerSelector = '#title';
        const titleElement = await editPage.waitForSelector(headerSelector);
        const titleValue = (await titleElement?.inputValue()).replace(/【.*?】/g, '');

        const newTCValue = await convertToTraditionalChinese(titleValue);
        console.log('newTCValue:', newTCValue);
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
    } catch (error) {
        console.log(`failer translate title: ${error}`);
        await translateTitle(editPage);
    }
}

export async function setConstant(editPage: Page) {
    console.log('start set constant');
    const defaultMSRP = '3000';
    const defaultInventory = '100';
    const defaultWeight = '0.5';

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

    if (domainName === targetUrl.Alia) {
        for (const weight of weightInputElementS) {
            const inputElement = await weight.$('input');
            if (inputElement) await inputElement.fill(defaultWeight);
        }
    }

    console.log('end set constant');
}

export async function setBarcode(editPage: Page, context: BrowserContext) {
    try {
        console.log('start set barcode');
        const linkClickSelector = 'a[href="javascript:"][onclick="jumpSourceUrl(this);"] > span';
        const linkInpuSelector = '#sourceUrl0';
        const barcodeLinkInput = await editPage.waitForSelector(linkInpuSelector);

        const linkElement = await editPage.$(linkClickSelector);
        await linkElement.click();
        const barCodePage = await context.waitForEvent('page');

        // const barCodePage = await context.newPage();
        // await context.waitForEvent('page');
        const barcodeInputElementS = await editPage.$$('[data-name="barcode"]');
        const link = await editPage.$eval(linkInpuSelector, (input: HTMLInputElement) => input.value);
        await handleGoToPage({ page: barCodePage, url: link });

        const url = await barCodePage.url();
        const domain = new URL(url);
        const domainName = domain.hostname.replace('www.', '');
        switch (domainName) {
            case targetUrl.Alia:
                const spanSelector =
                    'div.offer-attr-item span.offer-attr-item-name:has-text("货号") + span.offer-attr-item-value';
                const sliderSelector = '#nc_1_n1z';

                await barCodePage.waitForLoadState('networkidle');
                await barCodePage.$(sliderSelector);
                const needDragSliderElement = await barCodePage.$(sliderSelector);
                if (needDragSliderElement && (await needDragSliderElement.isVisible())) {
                    let ispass = false;
                    while (!ispass) {
                        const sliderBoxSelectoe = '#nc_1__scale_text';
                        const boxElement = await barCodePage.$(sliderBoxSelectoe);
                        const sliderBoundingBox = await boxElement.boundingBox();
                        const sliderX = sliderBoundingBox.x + sliderBoundingBox.width / 2;
                        const sliderHandle = await barCodePage.locator(sliderSelector).first();
                        // needDragSliderElement.
                        // await needDragSliderElement.hover();
                        // await needDragSliderElement.dispatchEvent('mousedown', { button: 'left' });
                        // await needDragSliderElement.dispatchEvent('mousemove', {
                        //     button: 'left',
                        //     targetPosition: { x: sliderX, y: 0 },
                        // });
                        await Sleep(1000);
                        await sliderHandle.dragTo(sliderHandle, { force: true, targetPosition: { x: sliderX, y: 0 } });
                        await Sleep(1000);
                        // await sliderHandle.dragTo(sliderHandle, { force: true, targetPosition: { x: sliderX, y: 0 } });

                        if (barCodePage && (await barCodePage.isVisible('#nc_1_refresh1'))) {
                            const refreshElement = await barCodePage.$('#nc_1_refresh1');
                            if (refreshElement && (await refreshElement.isVisible())) {
                                await refreshElement?.click();
                                return;
                            }
                        } else ispass = true;
                    }
                }
                await barCodePage.waitForLoadState('networkidle');
                // await Sleep(1000);
                const targetElement = await barCodePage.waitForSelector(spanSelector);
                const barcodeAlia = await targetElement.innerHTML();
                if (!barcodeAlia) throw new Error('barcode is empty');

                console.log(barcodeAlia);
                for (const barcodeInput of barcodeInputElementS) {
                    const inputElement = await barcodeInput.$('input');
                    if (inputElement) await inputElement.fill(barcodeAlia);
                }
                await barCodePage.close();
                break;
            case targetUrl.socwung:
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
        console.log('end set barcode');
    } catch (error) {
        console.log('failed set barcode');
        const pages = await context.pages();
        await pages[pages.length - 1].close();
        await setBarcode(editPage, context);
    }
}

export async function setMoney(editPage: Page) {
    console.log('start set money');
    const dollarRate = 33;
    const tBody = await editPage.waitForSelector('[data-name="price"]');
    const priceInputElementS = await editPage.$$('[data-name="price"]');
    // const link = await editPage.$eval(linkInpuSelector, (input: HTMLInputElement) => input.value);

    for (const price of priceInputElementS) {
        const inputElement = await price.$('input');
        const value = parseInt(await inputElement?.inputValue());
        if (inputElement) await inputElement.fill(String((value + 3.5) * dollarRate * 2 + 100));
    }
}

export async function setNameTitle(editPage: Page, SKU: string, config: typeof Config) {
    console.log('start name title');
    const skuInputElementS = await editPage.$$('[data-name="sku"]');
    const domainName = await getCurrentDoman(editPage);
    let newValue = '';
    let newSKU = '【';
    if (domainName === targetUrl.Alia) {
        const barcodeInputElementS = await editPage.$$('[data-name="barcode"]');
        barcodeInputElementS[0];
        newSKU += `sim${barcodeInputElementS[0]}`;
    } else {
        newSKU += SKU;
        // Get the current date
        const currentDate = moment();
        const formattedMonth = currentDate.format('MM');
        const currentWeek = Math.ceil(currentDate.date() / 7);
        newSKU += formattedMonth;
        newSKU += currentWeek;
        const paddedNumber = config.count.toString().padStart(2, '0');
        newSKU += paddedNumber;
    }

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
    config.count++;
}

export async function setSizeAndTranslate(editPage: Page) {
    console.log('start translate title');
    const headerSelector = '#cke_1_contents';
    const contentElement = await editPage.waitForSelector(headerSelector);
    const iframeElement = await contentElement.waitForSelector('iframe');
    const iframe = await iframeElement.contentFrame();
    const bodyElement = await iframe.$('body');
    console.log(await bodyElement?.innerHTML());
    const htmlString = await bodyElement?.innerHTML();
    const newTCValue = await convertToTraditionalChinese(await bodyElement?.innerHTML());
    let finalStr = '';

    const traditionalRegex = /[\u4e00-\u9fff]+/g;

    if (traditionalRegex.test(newTCValue)) {
        // The text contains both Simplified and Traditional Chinese characters
        // Remove the img tags and their contents
        finalStr = newTCValue.replace(/<img[^>]*>/g, '');
        // console.log(cleanedHtmlString);
    } else finalStr = newTCValue;
    // const newBodyElement = JSON.parse(newTCValue);
    const result = `
    <div style="text-align: center;">
        <span>【尺 碼 信 息 x Size info】</span>
    </div>
    ${finalStr}
    <div style="text-align: center;">
        <span>【手工平鋪測量，誤差允許在2~5cm左右，具體以實物為準</span>
    </div>
 `;

    await iframe.evaluate((html) => {
        document.body.innerHTML = html;
    }, result);
    console.log('newTCValue:', result);
}

export async function processImage(editPage: Page) {
    console.log('start process image');
    const showMoreBtn = await editPage.$('#showMoreImg');
    if (showMoreBtn && (await showMoreBtn.isVisible())) await showMoreBtn.click();
    const checkBoxs = await editPage.$$('input[type="checkbox"][name="selectedImg"]');
    const imageDivElements = await editPage.$$('.imgDivIn');
    const deleteBtns = await editPage.$$('.attach-icons.pull-right.yiImg');
    const urls = [];
    for (const checkBox of checkBoxs) {
        // const checkBox = await image.$('input[type="checkbox"][name="selectedImg"]');
        if (!(await checkBox.isChecked()) && (await checkBox.isVisible()) && !(await checkBox.isHidden()))
            await checkBox.click();
    }
    for (const image of imageDivElements) {
        const imageElement = await image.$('img');
        const url = await imageElement.getAttribute('src');
        if (url) urls.push(url);
    }
    const images = await Promise.all(urls.map((url) => loadImage(url)));
    const { removedIndices } = await removeSimilarImages(images);

    for (const index of removedIndices) {
        await deleteBtns[index].click();
    }
    console.log('end process image');
}
