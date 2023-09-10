import { BrowserContext, Page } from 'playwright';
import { convertToTraditionalChinese } from '../../utils/utils';
import XLSX from 'xlsx';
import { getDuplicatedIndexs } from '../filterHandle';
import { recognizeImage } from '../../utils/image';
import { exportPath } from '../../config/base';
import fs from 'fs';
import csv from 'csvtojson';
import { conditionalGrapSize, finalCheckSenstitiveCgaracter } from '../../utils/sizeImage';

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

    await saveSizeHtmlString(newTCinnerHtmlStr, titleValue, titleValue);
};

export const saveSizeHtmlString = async (newTCinnerHtmlStr: string, titleValue: string, code: any) => {
    try {
        const isIamgePattern = /<img[^>]*>/g;
        if (isIamgePattern.test(newTCinnerHtmlStr)) {
            let result = '';
            const imgTagList = newTCinnerHtmlStr.match(/<img[^>]*>|<img(.*?)>/g);
            const getImageSrcList = newTCinnerHtmlStr.match(/src="([^"]*)"[^>]*/g).map((str) => {
                if (str.match(/https:\/\//) || str.match(/http:\/\//)) {
                    const tempStr = str.replace(/src="|"/g, '');
                    const regex = /(https?:[^\s]+)/g;
                    const regex2 = /(http?:[^\s]+)/g;
                    const urls2 = tempStr.match(regex2);
                    if (urls2) return urls2[0];
                    const urls = tempStr.match(regex);
                    return urls[0];
                } else {
                    const tempStr = str.replace(/src="|(\/\/)|"/g, '');
                    const urls = tempStr.split(' ')[0];
                    //http:img1.vvic.com/upload
                    https: return 'https://' + urls;
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
                .match(/<p [^>]*>(.+?)<\/p>||<br>(.*?)<br>/g)
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

        // const fromImageTextJson = await csv().fromString(
        //     text.replace(/Qize information.-\n\n|Qize information./g, '').replace(/“|”|。/g, ''),
        // );
        let row2 = '';
        let templateKey: any[] = [];
        for (const [index, imageTextObject] of Object.values(fromImageTextJson).entries()) {
            const imageText = Object.values(imageTextObject)[0] as any;

            // header key
            if (conditionalGrapSize(imageText)) {
                console.log(splitString(imageText));
                // const imageTextArray = imageText.split(/\s+/gm);
                const imageTextArray = splitString(imageText).split(/\s+/gm);
                templateKey = imageTextArray;
            }

            // row data
            else if (imageText.match(/(?=.*\d)[\u4E00-\u9FFFa-zA-Z0-9]{0,5}/g) && imageText !== 'TAOCHUAN.STUDI0') {
                const tempstring = Object.values(imageTextObject)[0] as any;
                const newTempString = templateKey.map(
                    (key: any, index: any) => `${key} ${tempstring.split(/\s+/)[index]}`,
                );
                row2 += newTempString.join(' ') + '\n';
            }
        }
        // finnal check row data is expected
        if (!finalCheckSenstitiveCgaracter(row2.split(''))) continue;
        const combineResult = `【尺 碼 信 息 x Size info】\n${row2}\n手工平鋪測量，誤差允許在2~5cm左右，具體以實物為準`;
        rowDatas.push([code, combineResult]);

        console.log(rowDatas);
    }

    XLSX.utils.sheet_add_aoa(worksheet, rowDatas, { origin: -1 });

    XLSX.writeFile(workbook, destinationFile);
};

function splitString(inputString: string) {
    const evenPairs = [];
    const splitStrings = inputString.split(/\s/gm).filter((str) => str !== '');

    let curStr = '';
    for (let i = 0; i < splitStrings.length; i += 2) {
        curStr = splitStrings[i];
        // if(curStr=== "“")
        //     continue
        // if(curStr==="“")
        if (i + 1 < splitStrings.length) {
            evenPairs.push(splitStrings[i] + splitStrings[i + 1]);
        }
    }
    return evenPairs.join(' ');
}

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
