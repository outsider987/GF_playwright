import { BrowserContext, Page } from 'playwright';
import { downloadImage, loadImage } from '../../utils/image';
import * as fs from 'fs';
import { exportPath } from '../../config/base';
import axios from 'axios';
import { config } from 'process';
import { app } from 'electron';
import path from 'path';
import { convertToTraditionalChinese } from '../../utils/utils';

export const startShopeMode = async (editPage: Page, context: BrowserContext) => {
    let tryCound = 0;
    try {
        await editPage.waitForLoadState('networkidle');
        const titleElement = await editPage.waitForSelector('#productName');
        const categeoryElement = await editPage.waitForSelector('#categoryHistoryId');

        // start title
        const titleStr = (await titleElement.inputValue()).replace(/【(.*?)】/, '🌷');
        await titleElement.fill(titleStr);

        //expand

        const expandBtn = await editPage.$('#otherAttrShowAndHide');
        await expandBtn.click();
        const brandId = await editPage.$('.chosen-container.chosen-container-single');
        const a = await brandId.$('a');
        await a.click();
        const brandIdOption = await brandId.$('li.active-result.result-selected[data-option-array-index="1"]');
        await brandIdOption.click();

        const checkbox = await editPage.$(
            'input[type="checkbox"][value="1535"] + span.checkboxName:has-text("韩风(Korean)")',
        );
        if (!(await checkbox.isEnabled())) await checkbox.click();

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

        for (const input of inputFields) {
            await input.fill(price.toString());
        }

        const options = await categeoryElement.$$('option');
        // for (const option of options) {
        //     const str = await convertToTraditionalChinese(await option.innerText());
        //     const key = str.replace(/\((.*?)\)/, '');
        //     if ((await titleElement.innerText()).indexOf(key) !== -1) {
        //         await option.click();
        //         break;
        //     }
        // }
    } catch (error) {
        console.log(error);
        tryCound++;
        if (tryCound < 5) {
            throw 'failed startShopeMode';
        }
        await startShopeMode(editPage, context);
    }
};
