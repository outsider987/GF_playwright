import { BrowserContext, Page, ElementHandle } from 'playwright';
import { exportPath, sensitiveWord } from '../config/base';
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
    await page.waitForSelector('.categories-filter', { state: 'attached', timeout: 15000 });

    const categoriesFilters = await page.$$('.categories-filter');
    if (!categoriesFilters || categoriesFilters.length === 0) {
        throw new Error("'.categories-filter' not found on page");
    }

    const onlineProduct = categoriesFilters.length > 1 ? categoriesFilters[1] : categoriesFilters[0];
    // Find the specific category item whose label equals target, expand if collapsed
    const categoryItems = await onlineProduct.$$('.categories-item');
    let targetItem: ElementHandle<HTMLElement> | null = null;

    for (const item of categoryItems) {
        const labelDiv = await item.$('div');
        if (!labelDiv) continue;
        const labelText = (await labelDiv.innerText()).trim();
        if (labelText === globalState.target) {
            targetItem = item as ElementHandle<HTMLElement>;
            const classAttr = await item.getAttribute('class');
            if (classAttr && classAttr.includes('is-collapsed')) {
                const icon = await item.$('.fold-icon');
                if (icon) {
                    await icon.click();
                    await Sleep(300);
                }
            }
            break;
        }
    }

    if (!targetItem) {
        throw new Error(`categories-item for target "${globalState.target}" not found`);
    }

    const subItems = await targetItem.$$('.label-op-area');

    for (const elementClick of subItems) {
        if ((await elementClick.isVisible()) && globalState.subTarget === (await elementClick.innerText()).trim()) {
            await elementClick.click();
            const response = await context.waitForEvent('response');
            await Sleep(1000);
        }
    }
    console.log('open online product');
};
