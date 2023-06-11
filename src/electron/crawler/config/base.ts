export const mode = {
    routine: 'routine',
    sizeImage: 'sizeImage',
    downloadImagePackage: 'downloadImagePackage',
    shope: 'shope',
};

export const targetUrl = {
    Alia: 'detail.1688.com',
    Alia2: 'dianxiaomi.com',
    socwung: 'vvic.com',
};
export const exportPath = {
    sizeImage: 'temp/sizeImage',
    downloadImagePackage: 'temp/allImage',
    cookies: 'temp/cookies',
};
export const sensitiveWord = '胸圍腰圍臀圍衣長褲長袖長肩寬';

export const AliaRoute = [targetUrl.Alia, targetUrl.Alia2];

export const defaultCode = 'SBCMITFO';

export const globalState = {
    count: 1,
    debug: true,
    saveMode: false,
    mode: mode.routine,
    isRunning: false,
    target: '',
    subTarget: '',
};

export const routineState = {
    T: {
        code: 'T',
        name: '標題跟顏色 轉繁體',
        text: '標題跟顏色 轉繁體',
        enable: true,
        children: {},
    },
    C: {
        code: 'C',
        name: 'MSRP-庫存-重量',
        text: 'MSRP-庫存-重量',
        enable: true,
        children: {
            MSRP: {
                name: 'MSRP',
                text: 'MSRP',
                isLine: false,
                type: 'input',
                value: '3000',
                isTextNumer: true,
            },
            庫存: {
                name: '庫存',
                text: '庫存',
                isLine: false,
                type: 'input',
                value: '100',
                isTextNumer: true,
            },
            重量: {
                name: '重量',
                text: '重量',
                isLine: false,
                type: 'input',
                value: '0.5',
                isTextNumer: true,
            },
        },
    },

    M: {
        code: 'M',
        name: '金錢設定 (最近價錢 + 運費) x 匯率 + 另加)',
        text: '金錢設定 (最近價錢 + 運費) x 匯率 + 另加)',
        enable: true,
        children: {
            運費: {
                name: '運費',
                text: '運費',
                isLine: false,
                type: 'input',
                value: '3.5',
                isTextNumer: true,
            },
            匯率: {
                name: '匯率',
                text: '匯率',
                isLine: false,
                type: 'input',
                value: '33',
                isTextNumer: true,
            },
            另加: {
                name: '另加',
                text: '另加',
                isLine: false,
                type: 'input',
                value: '100',
                isTextNumer: true,
            },
        },
    },
    S: {
        code: 'S',
        name: '產品描述 編輯 (前墜 + 編輯內容 + 後墜)',
        text: '產品描述 編輯 (前墜 + 編輯內容 + 後墜)',
        enable: true,
        children: {

            移除圖片: {
                name: '移除圖片',
                text: '移除圖片',
                isLine: true,
                type: 'checkbox',
                value: true,
                isTextNumer: false,
            },
            移除文字: {
                name: '移除文字',
                text: '移除文字',
                isLine: true,
                type: 'checkbox',
                value: true,
                isTextNumer: false,
            },
            前墬: {
                name: '前墬',
                text: '前墬',
                isLine: false,
                type: 'input',
                value: '【尺 碼 信 息 x Size info】',
                isTextNumer: false,
            },
            後墬: {
                name: '後墬',
                text: '後墬',
                isLine: false,
                type: 'input',
                value: '手工平鋪測量，誤差允許在2~5cm左右，具體以實物為準',
                isTextNumer: false,
            },
        },
    },

    I: {
        code: 'I',
        name: '圖片訊息',
        text: '圖片訊息',
        enable: true,
        children: {
            勾選所有圖片: {
                name: '勾選所有圖片',
                text: '勾選所有圖片',
                isLine: true,
                type: 'checkbox',
                value: true,
                isTextNumer: false,
            },
            移除相同圖片: {
                name: '移除相同圖片',
                text: '移除相同圖片',
                isLine: true,
                type: 'checkbox',
                value: true,
                isTextNumer: false,
            }
        },

    },
    B: {
        code: 'B',
        name: '設定Barcode (目前支援搜款網跟阿里巴巴)',
        text: '設定Barcode (目前支援搜款網跟阿里巴巴)',
        enable: true,
        children: {},
    },
    F: {
        code: 'F',
        name: '標題代碼命名',
        text: '標題代碼命名 "【"前墬"+SKU/機器人編號+"後墬"+"使用順序號(幾月+第幾周+號碼)"】"',
        enable: true,
        children: {
            前墬: {
                name: '前墬',
                text: '前墬',
                isLine: false,
                type: 'input',
                value: '',
                isTextNumer: false,
            },
            後墬: {
                name: '後墬',
                text: '後墬',
                isLine: false,
                type: 'input',
                value: '',
                isTextNumer: false,
            },
            使用機器人編號: {
                name: '使用機器人編號',
                text: '使用機器人編號',
                isLine: true,
                type: 'checkbox',
                value: true,
                isTextNumer: false,
            },
            SKU取代標題: {
                name: 'SKU取代標題',
                text: 'SKU取代標題',
                isLine: true,
                type: 'checkbox',
                value: false,
                isTextNumer: false,
            },

            使用順序號: {
                name: '使用順序號',
                text: '使用順序號',
                isLine: true,
                type: 'checkbox',
                value: true,
                isTextNumer: false,
            },
            號碼: {
                name: '號碼',
                text: '號碼',
                isLine: false,
                type: 'input',
                value: 1,
                isTextNumer: false,
            },
        },
    },
    O: {
        code: 'O',
        name: 'SEO',
        text: 'SEO自動填入',
        enable: true,
        children: {

        }


    }
};
