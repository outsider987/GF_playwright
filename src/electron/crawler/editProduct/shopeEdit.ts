import { Browser, BrowserContext, Page } from 'playwright';
import { handleCloseModal, handleGoToPage } from '../utils/handler';
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
import { configPath } from '../../config/base';
import { startShopeMode } from './modeFunction/shopeMode';

// Function to scroll and load all elements
async function scrollToLoadAllElements(page: Page, container: any, selector: string): Promise<void> {
    let previousCount = 0;
    let currentCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 15;
    let noNewElementsCount = 0;
    
    console.log('[scrollToLoadAllElements] Starting to scroll and load all elements...');
    
    do {
        previousCount = currentCount;
        
        // Get current count of elements
        currentCount = await container.$$(selector).then((elements: any[]) => elements.length);
        console.log(`[scrollToLoadAllElements] Found ${currentCount} elements (attempt ${scrollAttempts + 1})`);
        
        if (currentCount > previousCount) {
            // New elements found, reset no new elements counter
            noNewElementsCount = 0;
            console.log(`[scrollToLoadAllElements] Found ${currentCount - previousCount} new elements`);
            
            // Scroll to the last element to trigger more loading
            const elements = await container.$$(selector);
            if (elements.length > 0) {
                const lastElement = elements[elements.length - 1];
                await lastElement.scrollIntoViewIfNeeded();
                await Sleep(1500); // Wait for potential lazy loading
            }
        } else {
            // No new elements found this round
            noNewElementsCount++;
            console.log(`[scrollToLoadAllElements] No new elements found (${noNewElementsCount}/3)`);
            
            // Try different scrolling strategies
            if (noNewElementsCount === 1) {
                // Strategy 1: Scroll the container
                await container.evaluate((el: Element) => {
                    el.scrollTop = el.scrollHeight;
                });
                await Sleep(1500);
            } else if (noNewElementsCount === 2) {
                // Strategy 2: Scroll the page
                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });
                await Sleep(1500);
            } else {
                // Strategy 3: Try clicking "Load More" or pagination if exists
                try {
                    const loadMoreBtn = await page.$('button:has-text("加载更多"), button:has-text("Load More"), .load-more, .pagination-next');
                    if (loadMoreBtn && await loadMoreBtn.isVisible()) {
                        console.log('[scrollToLoadAllElements] Found load more button, clicking...');
                        await loadMoreBtn.click();
                        await Sleep(2000);
                        noNewElementsCount = 0; // Reset counter after clicking load more
                    }
                } catch (e) {
                    console.log('[scrollToLoadAllElements] No load more button found');
                }
            }
        }
        
        scrollAttempts++;
        
    } while ((currentCount > previousCount || noNewElementsCount < 3) && scrollAttempts < maxScrollAttempts);
    
    console.log(`[scrollToLoadAllElements] Finished scrolling. Total elements found: ${currentCount} after ${scrollAttempts} attempts`);
}

export async function startShopeEditPage(
    page: Page,
    context: BrowserContext,
    config: { globalState: typeof globalConfigType; routineState: typeof routineState },
) {
    try {
        const tBodySelector = 'div .table-section';
        const headerSelector = '#title';

        await handleCloseModal(page);
        // if (config.globalState.target !== '' && config.globalState.subTarget !== '')
        //     await openOnlineProduct(page, context, config.globalState);
        // const draftDivElement = await page.waitForSelector('#draftDiv');
        // await Sleep(1000);
        // await draftDivElement.click();

        if (globalState.mode === 'shope') {
            // const alicegirlBtn = await page.waitForSelector('span:text("alicegirl")');
            // await alicegirlBtn.click();
            // await Sleep(1000);

            // Click the 「Shopee」采集箱(...) list item
            const shopeeListItem = await page.waitForSelector(
                'ul.lv2 > li > div:has-text("Shopee")',
                { state: 'visible' },
            );
            await shopeeListItem.click();
            await Sleep(1000);
        }
        const bodyElement = await page.waitForSelector(tBodySelector);
        console.log('start wait and collect edit with list');
        await bodyElement.waitForSelector('a:text("编辑")');

        // Scroll to load all edit elements
        console.log('[shopeEdit] Scrolling to load all edit elements...');
        await scrollToLoadAllElements(page, bodyElement, 'a:text("编辑")');

        // Final verification - wait a bit more and get final count
        await Sleep(2000);
        const edits = await bodyElement.$$('a:text("编辑")');
        
        // Double-check by scrolling to the very bottom one more time
        if (edits.length > 0) {
            const lastEdit = edits[edits.length - 1];
            await lastEdit.scrollIntoViewIfNeeded();
            await Sleep(1000);
        }
        
        // Get final count after all scrolling
        const finalEdits = await bodyElement.$$('a:text("编辑")');
        console.log(`[shopeEdit] Final count: ${finalEdits.length} edit elements found`);

        console.log(`[shopeEdit] Starting loop with ${finalEdits.length} edits to process`);

        for (const [index, edit] of finalEdits.entries()) {
            console.log(`[shopeEdit] Processing edit ${index + 1}/${finalEdits.length}`);
            const newEdit = await finalEdits[index];

            if (await !newEdit.isVisible()) {
                console.log(`[shopeEdit] Edit ${index + 1} is not visible, skipping`);
                continue;
            }
            await newEdit.click();

            const editPage = await context.waitForEvent('page');
            console.log(`[shopeEdit] Edit page opened for edit ${index + 1}, starting shopeMode`);
            if (!(await startShopeMode(editPage, context))) {
                console.log(`[shopeEdit] startShopeMode failed for edit ${index + 1}, closing page and continuing`);
                await editPage.close();
                continue;
            }

            if (config.globalState.saveMode) {
                console.log('start save');
                // if (SKU === '') {
                //     console.log('code no change, close edit page');
                //     editPage.close();
                // }
                
                // Final trigger to ensure CKEditor content is committed before save
                try {
                    const iframe = await editPage.$('iframe.cke_wysiwyg_frame.cke_reset');
                    if (iframe) {
                        const frame = await iframe.contentFrame();
                        if (frame) {
                            // Wait for iframe to be ready
                            await frame.waitForLoadState('domcontentloaded', { timeout: 3000 });
                            
                            // Trigger a final sync by clicking in the iframe and triggering events
                            await frame.click('body');
                            await frame.evaluate(() => {
                                // Trigger multiple events to ensure CKEditor syncs
                                const events = ['blur', 'change', 'input'];
                                events.forEach(eventType => {
                                    const event = new Event(eventType, { bubbles: true });
                                    document.body.dispatchEvent(event);
                                });
                            });
                            await Sleep(500);
                        }
                    }
                } catch (e) {
                    console.log('[shopeEdit] Final CKEditor trigger failed:', e);
                    // Continue with save even if trigger fails
                }
                
                const saveElement = await editPage.$('button.ant-btn.btn-orange:has-text("保存")');
                await Sleep(2000);
                await saveElement?.click();
                await Sleep(1000);
                if (await editPage.$('span:text("产品信息中有错误，请检查")')) {
                    await editPage.close();
                    continue;
                }

                // Wait for success modal content
                await editPage.waitForSelector('.ant-modal-body:has-text("您的产品编辑成功")');
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
