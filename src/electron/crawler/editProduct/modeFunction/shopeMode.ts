import { BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import XLSX from 'xlsx';
import { Sleep } from '../../utils/utils';

async function saveDebugArtifacts(editPage: Page, tag: string, extraInfo?: string): Promise<void> {
    try {
        const debugDir = path.resolve(process.cwd(), 'debug-artifacts');
        if (!fs.existsSync(debugDir)) {
            fs.mkdirSync(debugDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const basePath = path.join(debugDir, `${tag}-${timestamp}`);
        const url = editPage.url();
        const content = await editPage.content();
        try {
            await editPage.screenshot({ path: `${basePath}.png`, fullPage: true });
        } catch {}
        fs.writeFileSync(`${basePath}.html`, content);
        fs.writeFileSync(
            `${basePath}.txt`,
            [
                `URL: ${url}`,
                extraInfo ? `Extra: ${extraInfo}` : undefined,
                'Note: See screenshot (.png) and HTML (.html) alongside this file.',
            ]
                .filter(Boolean)
                .join('\n'),
        );
        console.log(`[startShopeMode] Saved debug artifacts at ${basePath}.{png,html,txt}`);
    } catch (e) {
        console.warn('[startShopeMode] Failed to save debug artifacts', e);
    }
}

export const startShopeMode = async (editPage: Page, context: BrowserContext): Promise<boolean> => {
    await Sleep(1000);
    let tryCound = 0;
    try {
        // Attach lightweight listeners for diagnostics
        editPage.on('console', (msg) => {
            try {
                console.log(`[page console ${msg.type()}]`, msg.text());
            } catch {}
        });
        editPage.on('pageerror', (err) => {
            console.log('[page error]', err?.message || err);
        });
        editPage.on('requestfailed', (req) => {
            console.log('[request failed]', req.url(), req.failure()?.errorText);
        });

        console.log('[startShopeMode] Waiting for domcontentloaded at', editPage.url());
        await Sleep(1000);
        await editPage.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
        console.log('[startShopeMode] Proceeding to wait for key form fields');
        // Updated selector: new DOM uses Ant Design form structure without #productName
        const keyTitleSelector = '.ant-form-item:has(label:has-text("产品标题")) input[type="text"]';
        const titleElement = await editPage.waitForSelector(keyTitleSelector, {
            state: 'visible',
            timeout: 60000,
        });
        // Updated category selector: Ant Design form item labeled 产品分类
        const categoryFormItem = await editPage.waitForSelector(
            '.ant-form-item:has(label:has-text("产品分类"))',
        );
     
        // if product was back then chose the category
        if (await (await titleElement.inputValue()).split('').includes('包')) {
            const categorySelector = await categoryFormItem.$('.ant-select .ant-select-selector');
            if (categorySelector) {
                await categorySelector.click();
                // Wait for dropdown to appear
                await editPage.waitForSelector('.ant-select-dropdown');
                const desiredOption = await editPage.$(
                    '.ant-select-dropdown .ant-select-item-option:has-text("側/肩背包")',
                );
                if (desiredOption) {
                    await desiredOption.click();
                } else {
                    // Fallback: try simplified Chinese text
                    const fallbackOption = await editPage.$(
                        '.ant-select-dropdown .ant-select-item-option:has-text("侧/肩背包")',
                    );
                    if (fallbackOption) {
                        await fallbackOption.click();
                    }
                }
            } else {
                // Fallback: try the "选择分类" button if present
                const chooseBtn = await categoryFormItem.$('button:has-text("选择分类")');
                if (chooseBtn) {
                    await chooseBtn.click();
                    // If a modal/picker opens, selecting logic could be added here as needed
                }
            }
        }

        // start title
        if (await (await titleElement.inputValue()).match(/🌷/)) {
            await editPage.close();
            return false;
        }
        await Sleep(1000);
        const key = (await titleElement.inputValue()).match(/\【(.*?)\】/);
        if (!key) {
            await editPage.close();
            return false;
        }
        const titleStr = (await titleElement.inputValue()).replace(/【(.*?)】/, '🌷').replace(/\d+$/, key[1]);
        const skuNumber = (await titleElement.inputValue()).match(/【(.*?)】/)[1];
        await titleElement.fill(titleStr);

        //expand

        // Updated expand button: scoped under section.img-display, with robust waits
        try {
            // Ensure the image display section exists
            await editPage.waitForSelector('section.img-display', { state: 'attached', timeout: 10000 });

            const byClass = editPage.locator('section.img-display').locator('span.link.view-more');
            const byText = editPage.locator('section.img-display').getByText('查看更多', { exact: false });

            let target = byClass;
            if ((await byClass.count()) === 0) {
                target = byText;
            }

            if ((await target.count()) > 0) {
                const first = target.first();
                await first.scrollIntoViewIfNeeded();
                // Some UIs need a hover before click
                await first.hover({ trial: true }).catch(() => {});
                await first.click({ timeout: 5000 }).catch(() => {});
            } else {
                console.warn('Expand button not found within section.img-display');
            }
        } catch (e) {
            console.warn('Expand button click failed', e);
        }

        const brandId = await editPage.$('.chosen-container.chosen-container-single');
        if (brandId && (await brandId.isVisible())) {
            const a = await brandId.$('a');
            await a.click();
            const brandIdOption = await brandId.$('li.active-result[data-option-array-index="1"]');
            await brandIdOption.click();

            const checkbox = await editPage.$(
                'input[type="checkbox"][value="1535"] + span.checkboxName:has-text("韩风(Korean)")',
            );
            if (checkbox && !(await checkbox.isChecked())) await checkbox.click();
        }

        // money (updated DOM)
        const moneyTable = await editPage.waitForSelector('table.myj-table');

        // Try to extract a suggested price from the approx text in price column, e.g., "≈ 980.00 USD"
        let price: number | null = null;
        try {
            const approxEl = await moneyTable.$('tbody tr td:nth-child(4) div:has-text("≈")');
            if (approxEl) {
                const approxText = await approxEl.innerText();
                const match = approxText.match(/([\d.]+)/);
                price = match ? parseFloat(match[1]) : null;
            }
        } catch {}

        // Collect price inputs in the 4th column
        const priceInputs = await moneyTable.$$('tbody tr td:nth-child(4) input.g-form-component');
        if (price !== null) {
            for (const input of priceInputs) {
                await input.fill(price.toString());
            }
        }

        // set inventory number in the 6th column (库存)
        const stockInputs = await moneyTable.$$('tbody tr td:nth-child(6) input.g-form-component');
        for (const input of stockInputs) {
            await input.fill('3');
        }

        const destinationFile = `${__dirname}/../../config/小米粒夏日.xlsx`;

        let workbook = XLSX.readFile(destinationFile, { sheets: 'Sheet1' });

        const jsons = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1']);

        const textareas = await editPage.$('textarea');
      

        for (const json of jsons) {
            const { 流水號, content } = json as any;
            const key = 流水號.match(/\【(.*?)\】/);
            if (key && skuNumber === key[1]) {
             
                const iframe = await editPage.$('iframe.cke_wysiwyg_frame.cke_reset');
                if (iframe) {
                    const frame = await iframe.contentFrame();
                    if (frame) {
                        const body = await frame.$('body');
                        if (body) {
                            const existingContent = await body.innerHTML();
                            const newContent = `<h3 style="text-align: center;">${content.replace(/\n/g, '<br>')}</h3>${existingContent}`;
                            await frame.evaluate((content) => {
                                document.body.innerHTML = content;
                            }, newContent);
                        }
                    }
                }
                // await textareas.fill(content + '\n\n' + existingContent);
            }
        }

        return true;
    } catch (error) {
        console.log('[startShopeMode] Error occurred:', error);
        await saveDebugArtifacts(
            editPage,
            'startShopeMode-failure',
            error instanceof Error ? `${error.name}: ${error.message}` : String(error),
        ).catch(() => {});
        tryCound++;
        if (tryCound > 5) {
            await editPage.close();
            throw 'failed startShopeMode';
        }

        return await startShopeMode(editPage, context);
    }
};
