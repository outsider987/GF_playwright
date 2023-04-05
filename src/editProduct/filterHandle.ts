import { Page } from 'playwright';

export const getCurrentDoman = async (editPage: Page) => {
    const linkInpuSelector = '#sourceUrl0';
    const barcodeLinkInput = await editPage.waitForSelector(linkInpuSelector);
    const domain = new URL(await barcodeLinkInput.inputValue());
    const domainName = domain.hostname.replace('www.', '');
    return domainName;
};
