import { BrowserContext, Page } from 'playwright';
import { convertToTraditionalChinese } from '../../utils/utils';
import { saveSizeHtmlString } from '../filterHandle';

export const startSizeImageProcess = async (editPage: Page, context: BrowserContext) => {
    const sizeFrameSelector = '#cke_1_contents';
    const contentElement = await editPage.waitForSelector(sizeFrameSelector);
    const iframeElement = await contentElement.waitForSelector('iframe');
    await iframeElement.waitForElementState('visible');

    const iframe = await iframeElement.contentFrame();
    const bodyElement = await iframe.$('body');

    const newTCinnerHtmlStr = await convertToTraditionalChinese(await bodyElement?.innerHTML());
    let finalStr = '';
    const isIamgePattern = /<img[^>]*>/g;
    if (isIamgePattern.test(newTCinnerHtmlStr)) {
        const headerSelector = '#title';
        const titleElement = await editPage.waitForSelector(headerSelector);
        const titleValue = await titleElement.inputValue();
        await saveSizeHtmlString(newTCinnerHtmlStr, titleValue);
    }
};
