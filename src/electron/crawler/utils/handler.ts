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

export const handleCloseModal = async (page: Page) => {
    const tBodySelector = '#shopifySysMsg';

    const MAX_ATTEMPTS = 5; // Maximum number of attempts to close the modal
    const INTERVAL = 5000; // Interval between attempts (in milliseconds)

    let attempts = 0;
    let modalClosed = false;
    await page.reload();
    while (!modalClosed && attempts < MAX_ATTEMPTS) {
        await Sleep(INTERVAL);
        // await page.reload();
        console.log('Attempt to close modal:', attempts + 1);
        // Try to find the close button by its class or by its button attributes
        let closeBtn = await page.$('.close');
        if (!closeBtn) {
            // Try to find the button by its text content and attributes as a fallback
            closeBtn = await page.$('button.btn-gray[type="button"][data-dismiss="modal"][onclick="loadNotice(false)"]');
        }
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

/**
 * Closes bullet-layer/comm-modal type modals that block pointer events.
 * These are Ant Design modals that appear as overlays.
 */
export const closeBulletLayerModal = async (page: Page, maxAttempts = 3): Promise<boolean> => {
    const modalSelectors = [
        '.ant-modal-wrap.bullet-layer',
        '.ant-modal-wrap.comm-modal',
        '.ant-modal-wrap[role="dialog"]',
    ];

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let modalFound = false;

        for (const selector of modalSelectors) {
            const modal = await page.$(selector);
            if (modal && await modal.isVisible()) {
                modalFound = true;
                console.log(`Found modal: ${selector}, attempting to close (attempt ${attempt + 1})...`);

                // Try multiple methods to close the modal
                // Method 1: Click the close button (X icon)
                const closeButtons = [
                    `${selector} .ant-modal-close`,
                    `${selector} button.ant-modal-close`,
                    `${selector} .ant-modal-close-x`,
                    `${selector} .anticon-close`,
                ];

                let closed = false;
                for (const btnSelector of closeButtons) {
                    const closeBtn = await page.$(btnSelector);
                    if (closeBtn && await closeBtn.isVisible()) {
                        try {
                            await closeBtn.click({ force: true });
                            await Sleep(500);
                            closed = true;
                            console.log(`Closed modal using: ${btnSelector}`);
                            break;
                        } catch (e) {
                            // Try next method
                        }
                    }
                }

                // Method 2: Try clicking cancel/close buttons in modal footer
                if (!closed) {
                    const footerButtons = [
                        `${selector} .ant-modal-footer button:has-text("取消")`,
                        `${selector} .ant-modal-footer button:has-text("关闭")`,
                        `${selector} .ant-modal-footer button:has-text("Cancel")`,
                        `${selector} .ant-modal-footer button:has-text("Close")`,
                    ];

                    for (const btnSelector of footerButtons) {
                        const btn = await page.$(btnSelector);
                        if (btn && await btn.isVisible()) {
                            try {
                                await btn.click({ force: true });
                                await Sleep(500);
                                closed = true;
                                console.log(`Closed modal using footer button: ${btnSelector}`);
                                break;
                            } catch (e) {
                                // Try next method
                            }
                        }
                    }
                }

                // Method 3: Press Escape key
                if (!closed) {
                    try {
                        await page.keyboard.press('Escape');
                        await Sleep(500);
                        console.log('Attempted to close modal with Escape key');
                    } catch (e) {
                        // Continue
                    }
                }

                break; // Found a modal, process next attempt
            }
        }

        if (!modalFound) {
            console.log('No bullet-layer modal detected.');
            return true;
        }

        await Sleep(500); // Wait before next check
    }

    // Final check if modal is still present
    for (const selector of modalSelectors) {
        const modal = await page.$(selector);
        if (modal && await modal.isVisible()) {
            console.log('Warning: Modal still present after close attempts');
            return false;
        }
    }

    return true;
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
