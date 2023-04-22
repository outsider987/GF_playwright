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

export const defaultCode = 'SBCMITF';

export const globalState = {
    count: 1,
    debug: true,
    saveMode: false,
    mode: mode.shope,
    isRunning: false,
    target: '',
    subTarget: '',
};

export const routineState = {
    T: {
        code: 'T',
        name: '標題跟顏色 轉繁體',
        enable: true,
        children: {},
    },
    C: {
        code: 'C',
        name: 'MSRP-庫存-重量',
        enable: true,
        children: {
            MSRP: {
                name: 'MSRP',
                isLine: false,
                type: 'input',
                value: '3000',
                isTextNumer: true,
            },
            庫存: {
                name: '庫存',
                isLine: false,
                type: 'input',
                value: '100',
                isTextNumer: true,
            },
            重量: {
                name: '重量',
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
        enable: true,
        children: {
            運費: {
                name: '運費',
                isLine: false,
                type: 'input',
                value: '3.5',
                isTextNumer: true,
            },
            匯率: {
                name: '匯率',
                isLine: false,
                type: 'input',
                value: '33',
                isTextNumer: true,
            },
            另加: {
                name: '另加',
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
        enable: true,
        children: {
            是否移除圖片: {
                name: '是否移除圖片',
                isLine: true,
                type: 'checkbox',
                value: true,
                isTextNumer: false,
            },
            是否移除文字: {
                name: '是否移除文字',
                isLine: true,
                type: 'checkbox',
                value: true,
                isTextNumer: false,
            },
            前墬: {
                name: '前墬',
                isLine: false,
                type: 'input',
                value: '【尺 碼 信 息 x Size info】',
                isTextNumer: false,
            },
            後墬: {
                name: '後墬',
                isLine: false,
                type: 'input',
                value: '手工平鋪測量，誤差允許在2~5cm左右，具體以實物為準',
                isTextNumer: false,
            },
        },
    },

    I: {
        code: 'I',
        name: '移除重複圖片及勾選所有圖片',
        enable: true,
        children: {},
    },
    B: {
        code: 'B',
        name: '設定Barcode (目前支援搜款網跟阿里巴巴)',
        enable: true,
        children: {},
    },
    F: {
        code: 'F',
        name: '標題代碼命名',
        enable: true,
        children: {
            使用機器人編號: {
                name: '使用機器人編號',
                isLine: true,
                type: 'checkbox',
                value: true,
                isTextNumer: false,
            },
            SKU取代標題: {
                name: 'SKU取代標題',
                isLine: true,
                type: 'checkbox',
                value: false,
                isTextNumer: false,
            },
            前墬: {
                name: '前墬',
                isLine: false,
                type: 'input',
                value: '',
                isTextNumer: false,
            },
            後墬: {
                name: '後墬',
                isLine: false,
                type: 'input',
                value: '',
                isTextNumer: false,
            },
            使用順序號: {
                name: '使用順序號',
                isLine: true,
                type: 'checkbox',
                value: true,
                isTextNumer: false,
            },
            號碼: {
                name: '號碼',
                isLine: false,
                type: 'input',
                value: 1,
                isTextNumer: false,
            },
        },
    },
};
