import { BrowserContext, Page } from 'playwright';
import { exportPath, sensitiveWord } from '../config/base';
import { recognizeImage } from '../utils/image';
import { Sleep } from '../utils/utils';
import { globalState as globalConfigType } from '../config/base';

export const getCurrentDoman = async (editPage: Page) => {
    const linkInpuSelector = '#sourceUrl0';
    const barcodeLinkInput = await editPage.waitForSelector(linkInpuSelector);
    const domain = new URL(await barcodeLinkInput.inputValue());
    const domainName = domain.hostname.replace('www.', '');
    return domainName;
};

export const getDuplicatedIndexs = (texts: string[]) => {
    const removedIndices: number[] = [];

    const sensitiveWordsArray = sensitiveWord.split('');

    for (const [index, text] of texts.entries()) {
        let isFind = false;
        for (const word of sensitiveWordsArray) {
            if (text.includes(word)) {
                removedIndices.push(index);
                isFind = true;
                break;
            }
        }
    }

    return { removedIndices };
};

export const openOnlineProduct = async (page: Page, context: BrowserContext, globalState: typeof globalConfigType) => {
    const onlineProduct = await page.$('#productOnlineTree');

    const collpaseElements = await onlineProduct.$$('.outDiv.node_top');
    for (const [index, collpase] of collpaseElements.entries()) {
        const label = await (await collpase.$('div')).innerText();
        const aTag = await collpase.$('a');
        if (aTag && (await aTag.isVisible()) && label === globalState.target) {
            await aTag.click();
        }
    }

    const elementClicks = await onlineProduct.$$(`div.myj_tree_node[title="${globalState.subTarget}"]`);
    for (const elementClick of elementClicks) {
        if (await elementClick.isVisible()) {
            await elementClick.click();
            const response = await context.waitForEvent('response');
            await Sleep(1000);
        }
    }
};
