import { BrowserContext, Page } from 'playwright';
import { exportPath, sensitiveWord } from '~/crawler/config/base';
import { recognizeImage } from '~/crawler/utils/image';
import fs from 'fs';
import csv from 'csvtojson';
import { Sleep } from '~/crawler/utils/utils';

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

export const saveSizeHtmlString = async (newTCinnerHtmlStr: string, titleValue: string) => {
    let result = '';
    const imgTagList = newTCinnerHtmlStr.match(/<img[^>]*>/g);
    const getImageSrcList = newTCinnerHtmlStr.match(/src="([^"]*)"[^>]*/g).map((str) => {
        // const tempStr = str.replace(/src="|(\/\/)|"/g, '');
        // const regex = /(https?:[^\s]+)/g;
        // const urls = tempStr.match(regex);
        // return 'https::'+urls[0];
        const tempStr = str.replace(/src="|(\/\/)|"/g, '');
        const urls = tempStr.split(' ');
        return 'https://' + urls[0];
    });
    const texts = await Promise.all(getImageSrcList.map((url) => recognizeImage(url)));
    const indexs = getDuplicatedIndexs(texts);

    for (const [index, imageTagStr] of imgTagList.entries()) {
        if (indexs.removedIndices.includes(index)) {
            result += `${imageTagStr.replace(/src="\/\//g, 'src="https://')}<br>${await convertTotableHtml(
                texts[index],
            )}<br>`;
        }
    }
    if (!fs.existsSync(exportPath.sizeImage)) {
        fs.mkdirSync(exportPath.sizeImage);
    }

    fs.writeFileSync(`${exportPath.sizeImage}/${titleValue}.html`, result);
    return result;
};

const convertTotableHtml = async (input: string) => {
    // const rows = input.trim().split('\n');

    // // Create the HTML table string
    // let tableHtml = '<table>\n';

    // for (let i = 0; i < rows.length; i++) {
    //     const row = rows[i].trim();

    //     if (row.length === 0) {
    //         continue; // Skip empty rows
    //     }

    //     const cells = row.split('\t');

    //     if (i === 0) {
    //         // Header row
    //         tableHtml += '<thead>\n<tr>\n';
    //         for (const cell of cells) {
    //             tableHtml += `<th>${cell}</th>\n`;
    //         }
    //         tableHtml += '</tr>\n</thead>\n<tbody>\n';
    //     } else if (cells.length === 1) {
    //         // Row with only one cell (for example, the "衣長" row)
    //         tableHtml += `<tr><td colspan="${cells.length}">${cells[0]}</td></tr>\n`;
    //     } else {
    //         // Normal row
    //         tableHtml += '<tr>\n';
    //         for (const cell of cells) {
    //             tableHtml += `<td>${cell}</td>\n`;
    //         }
    //         tableHtml += '</tr>\n';
    //     }
    // }

    // tableHtml += '</tbody>\n</table>';
    // return tableHtml;
    try {
        const json = await csv().fromString(input);
        let html = '<table><thead><tr>';

        for (let key in json[0]) {
            html += `<th>${key}</th>`;
        }

        html += '</tr></thead><tbody>';

        json.forEach((row: any) => {
            html += '<tr>';
            for (let key in row) {
                html += `<td>${row[key]}</td>`;
            }
            html += '</tr>';
        });

        html += '</tbody></table>';

        return html;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const openOnlineProduct = async (page: Page, context: BrowserContext) => {
    const collpaseElements = await page.$$('.outDiv.node_top');
    for (const [index, collpase] of collpaseElements.entries()) {
        const label = await (await collpase.$('div')).innerText();
        const aTag = await collpase.$('a');
        if (aTag && (await aTag.isVisible()) && label !== '所有分类') {
            await aTag.click();
        }
    }
    const elementClick = await page.$$('div.myj_tree_node[title="20230407"]');
    await elementClick[1].click();
    const response = await context.waitForEvent('response');
    await Sleep(1000);
};
