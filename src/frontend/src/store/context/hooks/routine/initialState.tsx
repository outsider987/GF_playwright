export const initialFlowItems = {
  T: {
    code: 'T',
    name: '翻譯標題跟顏色',
    enable: true,
    children: {},
  },
  C: {
    code: 'C',
    name: 'MSRP-庫存-重量',
    enable: true,
    children: {},
  },
  B: {
    code: 'B',
    name: '設定Barcode',
    enable: true,
    children: {},
  },
  M: {
    code: 'M',
    name: '金錢設定',
    enable: true,
    children: {},
  },
  S: {
    code: 'S',
    name: '產品描述 編輯',
    enable: true,
    children: {},
  },
  F: {
    code: 'F',
    name: '標題代碼命名',
    enable: true,
    children: {
      是否使用SKU取代標題: {
        name: '是否使用SKU取代標題',
        type: 'checkbox',
        value: true,
      },
      前墬: {
        name: '前墬',
        type: 'input',
        value: '',
      },
      後墬: {
        name: '後墬',
        type: 'input',
        value: '',
      },
    },
  },
  I: {
    code: 'I',
    name: '移除重複圖片及勾選所有圖片',
    enable: true,
    children: {},
  },
};
