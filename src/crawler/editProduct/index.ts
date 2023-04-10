import { Browser, BrowserContext, Page } from 'playwright';
import { handleClodeModal, handleGoToPage } from '../utils/handler';
import { convertToTraditionalChinese, Sleep } from '../utils/utils';
import moment from 'moment';
import { config as Config, defaultCode, mode } from '../config/base';
import { startProcessCodeFlow } from './processFlow';
import { WordTokenizer } from 'natural';
import { startSizeImageProcess } from './modeFunction/sizeImage';
import { startDownloadImageProcess } from './modeFunction/ImageDowloadPackage';
import { openOnlineProduct } from './filterHandle';
let currentEditIndex = 0;
export async function startEditPage(page: Page, context: BrowserContext, config: typeof Config) {
    try {
        const tBodySelector = '#shopifySysMsg';
        const headerSelector = '#title';

        await handleClodeModal(page);
        // await openOnlineProduct(page, context);

        const bodyElement = await page.waitForSelector(tBodySelector);

        console.log('start wait and collect edit with list');
        await bodyElement.waitForSelector('a:text("编辑")');

        const edits = await bodyElement.$$('a:text("编辑")');

        console.log('start loop edit');

        for (const [index, edit] of edits.entries()) {
            if (edits.length - 1 === currentEditIndex) {
                await page.close();
            }
            const newEdit = await edits[currentEditIndex];
            await newEdit.click();
            let SKU = '';
            const editPage = await context.waitForEvent('page');
            // await editPage.waitForLoadState('networkidle', { timeout: 40000 });
            await editPage.waitForSelector('[data-name="sku"]');
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
            switch (config.mode) {
                case mode.routine:
                    const regex = /[BCMSITF]+/; // Matches any characters between 【 and 】

                    // check title is match 【】
                    const matches = inputValue.match(regex);
                    if (matches) {
                        let code = matches[0].replace(/【|】|\d/g, '');

                        code = code.replace(/[^BCMSITF]*/g, '');
                        // if we leak some code, we need to run F at final
                        if (code.length > 0) {
                            code.replace('F', '');
                        }
                        SKU += code;
                        const codeArray = code.split('');
                        const defaultCodeSpilts = defaultCode.split('');

                        const needRunCode = defaultCodeSpilts.filter((item) => !codeArray.includes(item));
                        if (needRunCode.length === 0) {
                            currentEditIndex++;
                            await editPage.close();

                            continue;
                        }
                        SKU = await startProcessCodeFlow(needRunCode, editPage, context, SKU, config);
                    } else {
                        const needRunCode = defaultCode.split('');
                        SKU = await startProcessCodeFlow(needRunCode, editPage, context, SKU, config);
                    }

                    break;
                case mode.sizeImage:
                    await startSizeImageProcess(editPage, context);
                    return;

                case mode.downloadImagePackage:
                    await startDownloadImageProcess(editPage, context);
                    return;

                default:
                    break;
            }
            currentEditIndex++;

            if (config.saveMode && mode.routine === config.mode) {
                console.log('start save');
                if (SKU === '') {
                    console.log('code no change, close edit page');
                    editPage.close();
                }
                const saveElement = await editPage.$('[data-value="save-4"]');
                await saveElement?.click();
                await editPage.waitForSelector('#msgText');
                await editPage.close();
                console.log('end save');
            } else if (config.debuuger) debugger;
        }
        console.log('end loop edit');
    } catch (error) {
        console.log(`failed on \n count ${config.count} \n edit ${currentEditIndex} \n error: ${error} `);

        const editPage = await context.pages()[1];
        await editPage.close();
        await startEditPage(page, context, config);
    }
}
