import { Browser, BrowserContext, Page } from 'playwright';
import { handleGoToPage } from './utils/handler';
import { convertToTraditionalChinese, Sleep } from './utils/utils';
import moment from 'moment';
import { config as Config, defaultCode } from './config/base';
import zhConvert from 'zh-convert';

export const SelectAllEdit = async (page: Page) => {
    const selectAllSelector = '#selectAll';
    const dropDownSelector = '#dropdownMenu2';
    const batcListSelector = '#batchUl';

    await page.waitForSelector(selectAllSelector);
    await page.waitForSelector(dropDownSelector);

    const selectAllElement = await page.$(selectAllSelector);
    const dropDownElement = await page.$(dropDownSelector);

    const closeBtn = await page.waitForSelector(`button[data-dismiss="modal"]`);
    await closeBtn.click();
    await Sleep(1000);
    const closeBtn2 = await page.waitForSelector(`button[data-dismiss="modal"]`);
    await closeBtn2.click();

    await selectAllElement.click();
    await dropDownElement.hover();
    const ul = await page.$(batcListSelector);
    const lis = await ul.$$('li');
    await lis[1].click();

    // const edit = await page.waitForSelector(`a[${'sxz'}="${'batchEdit'}"]`);
    await Sleep(1000);
    debugger;
    // await edit.click();
    debugger;
};

export async function startEditPage(page: Page, context: BrowserContext, config: typeof Config) {
    try {
        const tBodySelector = '#shopifySysMsg';

        // editPage Select
        const headerSelector = '#title';

        await page.waitForSelector(tBodySelector);

        await page.waitForLoadState('networkidle');
        console.log('start close modal');
        const closeBtn = await page.$(`button[data-dismiss="modal"]`);

        if (closeBtn) await closeBtn.click();

        // const closeBtn2 = await page.waitForSelector(`button[data-dismiss="modal"]`);
        // await closeBtn2.click();

        const bodyElement = await page.$(tBodySelector);

        console.log('start wait and collect edit with list');
        await bodyElement.waitForSelector('a:text("编辑")');

        const edits = await bodyElement.$$('a:text("编辑")');

        console.log('start loop edit');
        for (const edit of edits) {
            await edit.click();

            const editPage = await context.waitForEvent('page');
            await editPage.waitForLoadState('networkidle');
            const skuInputElementS = await editPage.$$('[data-name="sku"]');
            let inputValue = '';
            for (const sku of skuInputElementS) {
                const inputElement = await sku.$('input');
                if (inputElement && (await inputElement.inputValue()) !== '') {
                    inputValue = await inputElement.inputValue();
                    break;
                }
            }

            console.log('loaded edit page');

            await editPage.waitForSelector(headerSelector);

            console.log('Input value:', inputValue);

            const regex = /[BCFMTS]+/; // Matches any characters between 【 and 】

            // check title is match 【】
            const matches = inputValue.match(regex);
            let SKU = '';

            if (matches) {
                const currentCode = matches[0];

                let code = currentCode.replace(/【|】|\d/g, '');
                code = code.replace(/[^BCFMTS]*/g, '');
                SKU += code;
                const codeArray = code.split('');
                const defaultCodeSpilts = defaultCode.split('');

                const needRunCode = defaultCodeSpilts.filter((item) => !codeArray.includes(item));

                for (const code of needRunCode) {
                    switch (code) {
                        case 'T':
                            await translateTitle(inputValue, editPage);
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

                        default:
                            break;
                    }
                }
            } else {
                const needRunCode = defaultCode.split('');
                for (const code of needRunCode) {
                    switch (code) {
                        case 'T':
                            await translateTitle(inputValue, editPage);
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

                        default:
                            break;
                    }
                }
            }

            console.log('start save');
            // const saveElement = await editPage.$('[data-value="save-4"]');
            // await saveElement?.click();
            // await editPage.waitForSelector('#msgText');
            console.log('end save');
            await editPage.close();
        }
        console.log('end loop edit');
    } catch (error) {
        console.log(`failed on ${config.count}`);
    }
}

async function translateTitle(inputValue: any, editPage: Page) {
    console.log('start translate title');
    const headerSelector = '#title';
    const titleElement = await editPage.waitForSelector(headerSelector);
    const newTCValue = await convertToTraditionalChinese(inputValue);
    console.log('newTCValue:', newTCValue);
    await titleElement.fill(newTCValue);
    console.log('end translate title');
}

async function setConstant(editPage: Page) {
    console.log('start set constant');
    const defaultMSRP = '3000';
    const defaultInventory = '100';
    const defaultWeight = '0.5';

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

    for (const weight of weightInputElementS) {
        const inputElement = await weight.$('input');
        if (inputElement) await inputElement.fill(defaultWeight);
    }
    console.log('end set constant');
}

async function setBarcode(editPage: Page, context: BrowserContext) {
    console.log('start set barcode');
    const linkInpuSelector = '#sourceUrl0';

    const barcodeLinkInput = await editPage.waitForSelector(linkInpuSelector);
    await editPage.waitForSelector('[data-name="barcode"]');
    const barcodeInputElementS = await editPage.$$('[data-name="barcode"]');

    const link = await editPage.$eval(linkInpuSelector, (input: HTMLInputElement) => input.value);
    const barCodePage = await context.newPage();
    await handleGoToPage({ page: barCodePage, url: link });

    const barcodeElement = await barCodePage.waitForSelector('text=货号:');
    const barcode = await (await barcodeElement.innerText()).replace(/\D/g, '');
    console.log(`barcode: ${barcode}`);

    for (const barcodeInput of barcodeInputElementS) {
        const inputElement = await barcodeInput.$('input');
        if (inputElement) await inputElement.fill(barcode);
    }

    await barCodePage.close();
    console.log('end set barcode');
}

async function setMoney(editPage: Page) {
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

async function setNameTitle(editPage: Page, SKU: string, config: typeof Config) {
    console.log('start name title');
    const skuInputElementS = await editPage.$$('[data-name="sku"]');
    let newSKU = '【';
    newSKU += SKU;
    let newValue = '';

    // Get the current date
    const currentDate = moment();
    const formattedMonth = currentDate.format('MM');
    const currentWeek = Math.ceil(currentDate.date() / 7);
    newSKU += formattedMonth;
    newSKU += currentWeek;
    const paddedNumber = config.count.toString().padStart(2, '0');
    newSKU += paddedNumber;
    newSKU += '】';

    const headerSelector = '#title';
    const titleElement = await editPage.waitForSelector(headerSelector);
    const titleValue = await titleElement.inputValue();
    if (!titleValue.match(/【[^【】]+】/g)) newValue = newSKU + titleValue.replace(/【|】/g, '');
    else newValue = titleValue.replace(/【[^【】]+】/g, newSKU);
    await titleElement.fill(newValue);

    for (const sku of skuInputElementS) {
        const inputElement = await sku.$('input');
        if (inputElement) await inputElement.fill(newSKU.replace(/【|】/g, ''));
    }
    config.count++;
}

async function setSizeAndTranslate(editPage: Page) {
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
    const traditional = zhConvert(newTCValue, 'traditional');
    if (traditional !== htmlString) {
        // The text contains both Simplified and Traditional Chinese characters
        // Remove the img tags and their contents
        finalStr = htmlString.replace(/<img[^>]*>/g, '');
        // console.log(cleanedHtmlString);
    }
    // const newBodyElement = JSON.parse(newTCValue);
    const template = `<span>【尺 碼 信 息 x Size info】</span>
${finalStr}

    <span>【手工平鋪測量，誤差允許在2~5cm左右，具體以實物為準</span>`;

    await iframe.evaluate((html) => {
        document.body.innerHTML = html;
    }, newTCValue);
    console.log('newTCValue:', newTCValue);
}
