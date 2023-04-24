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

    const headerSelector = '#title';
    const titleElement = await editPage.waitForSelector(headerSelector);
    const titleValue = await titleElement.inputValue();
    const find = titleValue.match(/\【(.*?)\】/);

    await saveSizeHtmlString(newTCinnerHtmlStr, titleValue, find[1]);
};

export const saveSizeHtmlString = async (newTCinnerHtmlStr: string, titleValue: string, code: any) => {
    try {
        const isIamgePattern = /<img[^>]*>/g;
        if (isIamgePattern.test(newTCinnerHtmlStr)) {
            let result = '';
            const imgTagList = newTCinnerHtmlStr.match(/<img[^>]*>|<img(.*?)>/g);
            const getImageSrcList = newTCinnerHtmlStr.match(/src="([^"]*)"[^>]*/g).map((str) => {
                if (str.match(/https:\/\//)) {
                    const tempStr = str.replace(/src="|"/g, '');
                    const regex = /(https?:[^\s]+)/g;
                    const urls = tempStr.match(regex);
                    return urls[0];
                } else {
                    const tempStr = str.replace(/src="|(\/\/)|"/g, '');
                    const urls = tempStr.split(' ')[0];

                    return 'https://' + urls;
                }
            });
            const texts = await Promise.all(getImageSrcList.map((url) => recognizeImage(url)));
            const indexs = getDuplicatedIndexs(texts);

            await saveExcelFile(titleValue, code, texts);

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
        } else {
            const spanTagList = newTCinnerHtmlStr
                .match(/<p [^>]*>(.+?)<\/p>/g)
                .map((str) => str.replace(/(<([^>]+)>|&nbsp;)/gi, ''));

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

            let workbook = XLSX.readFile(destinationFile, { sheets: 'Sheet1' });
            const worksheet = workbook.Sheets['Sheet1'];
            // adjust height
            worksheet['!rows'] = undefined; // reset all existing row heights
            worksheet['!rows'] = [{ hpt: 30, hpx: 30 }];

            // Set the width of column B to 20
            worksheet['!cols'] = [{ wch: 10 }, { wch: 20 }];
            const rowDatas = [] as any;
            for (const spanTag of spanTagList) {
                if (spanTag.split('').includes('圍') && spanTag.split('').includes('長')) {
                    const combineResult = `【尺 碼 信 息 x Size info】\n${spanTag}\n手工平鋪測量，誤差允許在2~5cm左右，具體以實物為準`;
                    rowDatas.push([code, combineResult]);
                }
            }

            XLSX.utils.sheet_add_aoa(worksheet, rowDatas, { origin: -1 });

            XLSX.writeFile(workbook, destinationFile);
            return true;
        }
    } catch (error) {
        console.log(error);
        return '';
    }
};

const saveExcelFile = async (titleValue: string, code: any, texts: any) => {
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

    let workbook = XLSX.readFile(destinationFile, { sheets: 'Sheet1' });

    const worksheet = workbook.Sheets['Sheet1'];
    // adjust height
    worksheet['!rows'] = undefined; // reset all existing row heights
    worksheet['!rows'] = [{ hpt: 30, hpx: 30 }];

    // Set the width of column B to 20
    worksheet['!cols'] = [{ wch: 10 }, { wch: 20 }];
    const headeJsons = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as any;
    const obj = {} as any;
    for (let i = 0; i < headeJsons.length; i++) {
        obj[headeJsons[i]] = '';
    }

    const rowDatas = [] as any;
    for (const text of texts) {
        if (!text.split('').includes('尺') && !text.split('').includes('寸')) continue;

        // to get only had sensitive word
        const fromImageTextJson = await csv().fromString(text);
        let row2 = '';
        let templateKey = [];
        for (const [index, imageTextObject] of Object.values(fromImageTextJson).entries()) {
            const imageText = Object.values(imageTextObject)[0] as any;
            if (imageText.split('').includes('尺') && imageText.split('').includes('圍')) {
                const imageTextArray = imageText.split(/\s+/gm);
                templateKey = imageTextArray;
                // row2 = imageTextArray.join(' ');
                // row2 += '\n';
            } else if (imageText.match(/(?=.*\d)[\u4E00-\u9FFFa-zA-Z0-9]{0,5}/g)) {
                const tempstring = Object.values(imageTextObject)[0] as any;
                const newTempString = templateKey.map(
                    (key: any, index: any) => `${key} ${tempstring.split(/\s+/)[index]}`,
                );
                row2 += newTempString.join(' ') + '\n';
                // row2 = row2.replace(/\s+/g, '');
            }
        }
        if (!row2.split('').includes('尺')) continue;
        const combineResult = `【尺 碼 信 息 x Size info】\n${row2}\n手工平鋪測量，誤差允許在2~5cm左右，具體以實物為準`;
        rowDatas.push([code, combineResult]);

        console.log(rowDatas);
    }

    XLSX.utils.sheet_add_aoa(worksheet, rowDatas, { origin: -1 });

    XLSX.writeFile(workbook, destinationFile);
};

const convertTotableHtml = async (input: string) => {
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
