import { Browser, BrowserContext, Page } from 'playwright';
import { handleClodeModal, handleGoToPage } from '../utils/handler';
import { convertToTraditionalChinese, Sleep } from '../utils/utils';
import moment from 'moment';
import {
    globalState as Config,
    defaultCode,
    routineState,
    mode,
    globalState as globalConfigType,
    globalState,
} from '../config/base';
import { startProcessCodeFlow } from './processFlow';
import { WordTokenizer } from 'natural';
import { startSizeImageProcess } from './modeFunction/sizeImage';
import { startDownloadImageProcess } from './modeFunction/ImageDowloadPackage';
import { openOnlineProduct } from './filterHandle';
import * as fs from 'fs';
import { configPath } from '../../config/bast';
import { startShopeMode } from './modeFunction/shopeMode';

export async function startShopeEditPage(
    page: Page,
    context: BrowserContext,
    config: { globalState: typeof globalConfigType; routineState: typeof routineState },
) {
    try {
        const tBodySelector = '#pageList';
        const headerSelector = '#title';

        await handleClodeModal(page);
        // if (config.globalState.target !== '' && config.globalState.subTarget !== '')
        //     await openOnlineProduct(page, context, config.globalState);
        const draftDivElement = await page.waitForSelector('#draftDiv');
        await Sleep(1000);
        await draftDivElement.click();

        if (globalState.mode === 'shope') {
            const alicegirlBtn = await page.waitForSelector('a:text("alicegirl")');
            await alicegirlBtn.click();
            await Sleep(1000);
        }
        const bodyElement = await page.waitForSelector(tBodySelector);
        console.log('start wait and collect edit with list');
        await bodyElement.waitForSelector('a:text("编辑")');

        const edits = await bodyElement.$$('a:text("编辑")');

        console.log('start loop edit');

        for (const [index, edit] of edits.entries()) {
            const newEdit = await edits[index];

            if (await !newEdit.isVisible()) continue;
            await newEdit.click();

            const editPage = await context.waitForEvent('page');
            if (!(await startShopeMode(editPage, context))) continue;

            if (config.globalState.saveMode) {
                console.log('start save');
                // if (SKU === '') {
                //     console.log('code no change, close edit page');
                //     editPage.close();
                // }
                const saveElement = await editPage.$('.btn-orange.m-left10.toSubmit:text("保存")');
                await saveElement?.click();
                await editPage.waitForSelector('#msgText');
                await editPage.close();
                console.log('end save');
            } else if (config.globalState.debug) debugger;
        }
        console.log('end loop edit');
    } catch (error) {
        console.log(`failed on \n count ${config.globalState.mode} \n edit  \n error: ${error} `);

        const editPage = await context.pages()[1];
        await editPage.close();
        await startShopeEditPage(page, context, config);
    }
}
