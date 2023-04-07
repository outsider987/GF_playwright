import { chromium, Browser, Page } from 'playwright';
import { Sleep } from './utils';

const RETRY_LIMIT = 3; // Maximum number of retries
const RETRY_DELAY = 3000; // Delay between retries in milliseconds
const TIMEOUT = 30000; // Timeout for page navigation in milliseconds

interface ReRequestPageProps {
    page: Page;
    url: string;
    retry?: number;
    selector?: string;
}

export const handleGoToPage = async ({ page, url, retry = 0 }: ReRequestPageProps): Promise<Page> => {
    try {
        await page.goto(url, { timeout: TIMEOUT });
        // Do something with the page content here
    } catch (error) {
        console.log(`Error: ${error.message}, retrying in ${RETRY_DELAY}ms...`);

        if (retry < RETRY_LIMIT) {
            await handleGoToPage({ page, url, retry: retry + 1 });
            // await page.reload();
        } else throw new Error(`Failed to load page ${url} after ${retry} retries.`);
    }

    return page;
};

export const reWaitSelector = async ({ page, selector, retry = 0 }: ReRequestPageProps) => {};

export const handleClodeModal = async (page: Page) => {
    const tBodySelector = '#shopifySysMsg';

    await page.waitForSelector(tBodySelector);

    await page.waitForLoadState('networkidle');
    console.log('start close modal');
    const closeBtn = await page.$(`.close`);

    if (closeBtn && (await closeBtn.isVisible())) await closeBtn.click();
    await Sleep(1000);
    if (closeBtn && (await closeBtn.isVisible())) await closeBtn.click();
};
