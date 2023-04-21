import { BrowserContext, Page } from 'playwright';
import { convertToTraditionalChinese } from '../../utils/utils';
import XLSX from 'xlsx';
import { getDuplicatedIndexs } from '../filterHandle';
import { recognizeImage } from '../../utils/image';
import { exportPath } from '../../config/base';
import fs from 'fs';
import csv from 'csvtojson';

export const startSizeImageProcess = async (editPage: Page, context: BrowserContext, collectDatas: any[]) => {
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
        const find = titleValue.match(/\【(.*?)\】/);

        await saveSizeHtmlString(newTCinnerHtmlStr, titleValue, find[1]);
    }
};
export const saveSizeHtmlString = async (newTCinnerHtmlStr: string, titleValue: string, code: any) => {
    try {
        let result = '';
        const imgTagList = newTCinnerHtmlStr.match(/<img[^>]*>/g);
        const getImageSrcList = newTCinnerHtmlStr.match(/src="([^"]*)"[^>]*/g).map((str) => {
            if (str.match(/https:\/\//)) {
                const tempStr = str.replace(/src="|"/g, '');
                const regex = /(https?:[^\s]+)/g;
                const urls = tempStr.match(regex);
                return urls[0];
            } else {
                const tempStr = str.replace(/src="|(\/\/)|"/g, '');
                const urls = tempStr.split(' ')[0];

                return 'https://' + urls[0];
            }
        });
        const texts = await Promise.all(getImageSrcList.map((url) => recognizeImage(url)));

        const indexs = getDuplicatedIndexs(texts);

        const sourceFile = `${__dirname}/../../config/template.xlsx`;

        // Path to the destination file
        const destinationFile = `${__dirname}/../../config/output.xlsx`;

        if (!fs.existsSync(destinationFile)) {
            const readStream = fs.createReadStream(sourceFile);

            const writeStream = fs.createWriteStream(destinationFile);
            await readStream.pipe(writeStream);

            await writeStream.on('finish', () => {
                console.log('File copied successfully.');
            });
        }

        // Pipe the read stream to the write stream to copy the file

        let workbook = XLSX.readFile(destinationFile, { sheets: 'Sheet1' });
        // let workbook = XLSX.readFile(`${__dirname}/../../config/output.xlsx`, { sheets: 'Sheet1' });
        // if (!workbook) workbook = XLSX.readFile(`${__dirname}/../../config/template.xlsx`, { sheets: 'Sheet1' });
        const worksheet = workbook.Sheets['Sheet1'];
        const headeJsons = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as any;
        const obj = {} as any;
        for (let i = 0; i < headeJsons.length; i++) {
            obj[headeJsons[i]] = '';
        }

        const rowDatas = [] as any;
        for (const text of texts) {
            if (!text.split('').includes('尺') && !text.split('').includes('長')) continue;

            // to get only had sensitive word
            const fromImageTextJson = await csv().fromString(text);
            let row2 = '';
            for (const [index, imageTextObject] of Object.values(fromImageTextJson).entries()) {
                if (index === 0) {
                    const imageText = Object.values(imageTextObject)[0] as any;

                    const imageTextArray = imageText.split(/\s+/gm);
                    row2 = imageTextArray.join(' ');
                    row2 += '\n';
                } else {
                    const tempstring = Object.values(imageTextObject)[0] as any;
                    row2 += tempstring.split(/\s+/).join(' ') + '\n';
                    // row2 = row2.replace(/\s+/g, '');
                }
            }
            if (!row2.split('').includes('尺')) continue;
            rowDatas.push([code, row2]);

            console.log(rowDatas);
        }

        XLSX.utils.sheet_add_aoa(worksheet, rowDatas, { origin: -1 });
        // XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet2');

        XLSX.writeFile(workbook, destinationFile);
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
    } catch (error) {
        console.log(error);
        return '';
    }
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
