import { Browser, BrowserContext, Page } from 'playwright';
import { handleGoToPage } from '../utils/handler';
import { convertToTraditionalChinese, Sleep } from '../utils/utils';
import moment from 'moment';
import { config as Config, defaultCode } from '../config/base';
import { loadImage, removeSimilarImages } from '../utils/image2';
import { startProcessCodeFlow } from './processFlow';

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
        const closeBtn = await page.$(`.close`);

        if (closeBtn && (await closeBtn.isVisible())) await closeBtn.click();
        await Sleep(1000);
        if (closeBtn && (await closeBtn.isVisible())) await closeBtn.click();
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

            const regex = /[BCMSITF]+/; // Matches any characters between 【 and 】

            // check title is match 【】
            const matches = inputValue.match(regex);
            let SKU = '';

            if (matches) {
                let code = matches[0].replace(/【|】|\d/g, '');

                code = code.replace(/[^BCMSITF]*/g, '');
                // if we leak some code, we need to run F at final
                if (code.length > 0) {
                    const index = code.indexOf('F');
                    index !== -1 && (code = code.slice(index));
                }
                SKU += code;
                const codeArray = code.split('');
                const defaultCodeSpilts = defaultCode.split('');

                const needRunCode = defaultCodeSpilts.filter((item) => !codeArray.includes(item));

                SKU = await startProcessCodeFlow(needRunCode, editPage, context, SKU, config);
            } else {
                const needRunCode = defaultCode.split('');
                SKU = await startProcessCodeFlow(needRunCode, editPage, context, SKU, config);
            }

            if (config.saveMode) {
                console.log('start save');
                if (SKU === '') {
                    console.log('code no change, close edit page');
                    editPage.close();
                }
                const saveElement = await editPage.$('[data-value="save-4"]');
                await saveElement?.click();
                await editPage.waitForSelector('#msgText');
                console.log('end save');
            } else debugger;

            await editPage.close();
        }
        console.log('end loop edit');
    } catch (error) {
        console.log(`failed on ${config.count}`);
        const editPage = await context.pages()[1];
        await editPage.close();
        await startEditPage(page, context, config);
    }
}
