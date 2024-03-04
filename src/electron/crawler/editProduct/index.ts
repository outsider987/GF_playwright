import { BrowserContext, Page } from 'playwright';
import { handleClodeModal, handleGoToPage } from '../utils/handler';
import {
    globalState as Config,
    defaultCode,
    routineState,
    mode,
    globalState as globalConfigType,
    downloadState as downloadStateType,
} from '../config/base';
import { startProcessCodeFlow } from './processFlow';
import { startSizeImageProcess } from './modeFunction/sizeImage';
import { startDownloadImageProcess } from './modeFunction/ImageDowloadPackage';
import { openOnlineProduct } from './filterHandle';
import { startShopeMode } from './modeFunction/shopeMode';
import { Sleep } from '../utils/utils';

export async function startEditPage(
    page: Page,
    context: BrowserContext,
    config: {
        globalState: typeof globalConfigType;
        routineState: typeof routineState;
        downloadState: typeof downloadStateType;
    },
) {
    let currentEditIndex = 0;
    try {
        const tBodySelector = '#shopifySysMsg';
        const headerSelector = '#title';

        await handleClodeModal(page);
        if (config.globalState.target !== '' && config.globalState.subTarget !== '')
            await openOnlineProduct(page, context, config.globalState);

        const bodyElement = await page.waitForSelector(tBodySelector);

        console.log('start wait and collect edit with list');

        await bodyElement.waitForSelector('a:text("编辑")');

        const edits = await bodyElement.$$('a:text("编辑")');

        console.log('start loop edit');
        const collectDatas = [] as any;

        for (const [index, edit] of edits.entries()) {
            if (edits.length === currentEditIndex) {
                await page.close();
            }
            const newEdit = await edits[currentEditIndex];
            await Sleep(300);
            await newEdit.click();

            const editPage = await context.waitForEvent('page');

            let SKU = '';

            console.log('loaded edit page');

            await editPage.waitForSelector(headerSelector);
            switch (config.globalState.mode) {
                case mode.routine:
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
                    const regex = /[BCMSITOF]+/; // Matches any characters between 【 and 】

                    // check title is match 【】
                    const matches = inputValue.match(regex);
                    if (matches) {
                        let code = matches[0].replace(/【|】|\d/g, '');

                        code = code.replace(/[^BCMSITOF]*/g, '');
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
                    await startSizeImageProcess(editPage, context, collectDatas);
                    currentEditIndex++;
                    await editPage.close();
                    continue;

                case mode.downloadImagePackage:
                    await startDownloadImageProcess(editPage, context, config.downloadState);
                    currentEditIndex++;
                    await editPage.close();
                    continue;

                case mode.shope:
                    startShopeMode(editPage, context);
                    break;

                default:
                    break;
            }
            currentEditIndex++;

            if (config.globalState.saveMode && mode.routine === config.globalState.mode) {
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
            } else if (config.globalState.debug) debugger;
        }
        console.log('end loop edit');
    } catch (error) {
        console.log(`failed on \n count ${config.globalState.mode} \n edit ${currentEditIndex} \n error: ${error} `);

        const editPage = await context.pages()[1];
        await editPage.close();
        await startEditPage(page, context, config);
    }
}
