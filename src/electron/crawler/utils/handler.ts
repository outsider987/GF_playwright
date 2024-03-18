import { chromium, Browser, Page } from 'playwright';
import { Sleep } from './utils';

const RETRY_LIMIT = 3; // Maximum number of retries
const RETRY_DELAY = 3000; // Delay between retries in milliseconds
const TIMEOUT = 30000; // Timeout for page navigation in milliseconds

interface ReRequestPageProps {
    page: Page;
    url: string;
    retry?: number;
    isignoreLoaded: boolean;
    selector?: string;
}

export const handleGoToPage = async ({
    page,
    url,
    isignoreLoaded = false,
    retry = 0,
}: ReRequestPageProps): Promise<Page> => {
    try {
        await page.goto(url, { timeout: TIMEOUT, waitUntil: isignoreLoaded ? 'domcontentloaded' : 'networkidle' });
        // Do something with the page content here
    } catch (error) {
        console.log(`Error: ${error.message}, retrying in ${RETRY_DELAY}ms...`);

        if (retry < RETRY_LIMIT) {
            await handleGoToPage({ page, url, isignoreLoaded, retry: retry + 1 });
            // await page.reload();
        } else throw new Error(`Failed to load page ${url} after ${retry} retries.`);
    }

    return page;
};

export const reWaitSelector = async ({ page, selector, retry = 0 }: ReRequestPageProps) => {};

export const handleClodeModal = async (page: Page) => {
    const tBodySelector = '#shopifySysMsg';

    const MAX_ATTEMPTS = 5; // Maximum number of attempts to close the modal
    const INTERVAL = 1000; // Interval between attempts (in milliseconds)

    let attempts = 0;
    let modalClosed = false;

    while (!modalClosed && attempts < MAX_ATTEMPTS) {
        await Sleep(INTERVAL);
        console.log('Attempt to close modal:', attempts + 1);

        const closeBtn = await page.$('.close');
        if (closeBtn && (await closeBtn.isVisible())) {
            await closeBtn.click();
            await Sleep(INTERVAL); // Wait for modal to close
            modalClosed = !(await closeBtn.isVisible()); // Check if modal is still visible
        } else {
            modalClosed = true; // If close button is not found or not visible, assume modal is already closed
        }

        attempts++;
    }

    if (modalClosed) {
        console.log('Modal closed successfully.');
    } else {
        console.log('Failed to close modal after maximum attempts.');
    }
};

export const handleError = async (
    fun: any,
    param: {
        code: any;
        config: any;
    },
    tryErrorCount: any = 0,
) => {
    try {
        console.log(`［${param.code}］ start`);
        await fun();
        console.log(`［${param.code}］ end`);
    } catch (error) {
        tryErrorCount++;
        if (tryErrorCount === 5) throw ' failed on process flow';
        console.log(`at ［${param.code}］ failed with ${tryErrorCount}`);
        await handleError(fun, param, tryErrorCount);
    }
};
