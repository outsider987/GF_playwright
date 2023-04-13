export const initialRoutineState = {
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
        value: '',
        isTextNumer: true,
      },
      庫存: {
        name: '庫存',
        isLine: false,
        type: 'input',
        value: '',
        isTextNumer: true,
      },
      重量: {
        name: '重量',
        isLine: false,
        type: 'input',
        value: '',
        isTextNumer: true,
      },
    },
  },

  M: {
    code: 'M',
    name: '金錢設定 (最近價錢 x 匯率 + 另加)',
    enable: true,
    children: {
      匯率: {
        name: '匯率',
        isLine: false,
        type: 'input',
        value: '',
        isTextNumer: true,
      },
      另加: {
        name: '另加',
        isLine: false,
        type: 'input',
        value: '',
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
      SKU取代標題: {
        name: 'SKU取代標題',
        isLine: true,
        type: 'checkbox',
        value: true,
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
      },
      號碼: {
        name: '號碼',
        isLine: false,
        type: 'input',
        value: '1',
        isTextNumer: false,
      },
    },
  },
};
