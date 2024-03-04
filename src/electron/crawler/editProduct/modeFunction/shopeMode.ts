import { BrowserContext, Page } from 'playwright';
import XLSX from 'xlsx';
import { Sleep } from '../../utils/utils';

export const startShopeMode = async (editPage: Page, context: BrowserContext): Promise<boolean> => {
    await Sleep(1000);
    let tryCound = 0;
    try {
        await editPage.waitForLoadState('networkidle');
        const titleElement = await editPage.waitForSelector('#productName');
        const categeoryElement = await editPage.waitForSelector('#categoryHistoryId');

        // if product was back then chose the category
        if (await (await titleElement.inputValue()).split('').includes('包')) {
            await categeoryElement.click();
            categeoryElement.$$eval('option', (options) => {
                if (options) {
                    for (const option of options) {
                        if (option.innerText === '側/肩背包') {
                            option.setAttribute('selected', 'selected');
                        }
                    }
                }
            });
        }

        // start title
        if (await (await titleElement.inputValue()).match(/🌷/)) {
            await editPage.close();
            return false;
        }
        const key = (await titleElement.inputValue()).match(/\【(.*?)\】/);
        const titleStr = (await titleElement.inputValue()).replace(/【(.*?)】/, '🌷').replace(/\d+$/, key[1]);
        const skuNumber = (await titleElement.inputValue()).match(/【(.*?)】/)[1];
        await titleElement.fill(titleStr);

        //expand

        const expandBtn = await editPage.$('#otherAttrShowAndHide');
        await expandBtn.click();

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

        // money
        const moneyTable = await editPage.$('#skuInfoTable');
        const priceTargetElement = await moneyTable.$('.price-rate-switch-result-box');
        const priceElement = await priceTargetElement.$('.priceRateSwitchResult');

        // Get the text content of the price element
        const priceText = await priceElement.innerText();

        // Extract the number from the price text
        const regex = /([\d.]+)/;
        const match = priceText.match(regex);
        const price = match ? parseFloat(match[1]) : null;
        const inputFields = await moneyTable.$$('[name="price"]');
        const productStocks = await editPage.$$(
            'input.form-component.p-right25.sameVarinatIpt[type="text"][name="stock"][formtype="productStock"][datatype="productStock"]',
        );

        for (const input of inputFields) {
            await input.fill(price.toString());
        }

        // set inventory number
        for (const input of productStocks) {
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
                await textareas.fill(content);
            }
        }

        return true;
    } catch (error) {
        console.log(error);
        tryCound++;
        if (tryCound > 5) {
            await editPage.close();
            throw 'failed startShopeMode';
        }

        return await startShopeMode(editPage, context);
    }
};
