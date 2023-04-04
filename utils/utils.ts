// import { OpenCC } from 'opencc';
import * as OpenCC from 'opencc-js';

export function Sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// 簡體轉繁體字函數
export async function convertToTraditionalChinese(simplifiedChinese: any) {
    // const converter = new OpenCC('s2t.json');
    // const result: string = await converter.convertPromise('汉字');
    // console.log(result);
    // return result;

    const converter = OpenCC.Converter({ from: 'cn', to: 'hk' });
    return converter(simplifiedChinese);
}

export async function waitForSelectorWithRetry(
    page: any,
    selector: string,
    timeout: number = 5000,
    retryInterval: number = 1000,
    maxRetries: number = 5,
) {
    let retryCount = 0;
    while (retryCount < maxRetries) {
        try {
            await page.waitForSelector(selector, { timeout });
            return;
        } catch (err) {
            retryCount++;
            console.log(`Error: ${err.message}, retrying in ${retryInterval}ms...`);
            await page.waitForTimeout(retryInterval);
        }
    }
    throw new Error(`Could not find selector ${selector} after ${maxRetries} retries`);
}
