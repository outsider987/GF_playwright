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
