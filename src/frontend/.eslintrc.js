module.exports = {
  'env': {
    'browser': true,
    'es2021': true
  },
  "extends": [
    "plugin:tailwindcss/recommended"
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest'
  },
  'plugins': ['@typescript-eslint', 'tailwindcss'],
  'rules': {},
  "settings": {
    "tailwindcss": {
      // These are the default values but feel free to customize
      "callees": ["classnames", "clsx", "ctl"],
      "config": "tailwind.config.js",
      "groups": defaultGroups, // imported from groups.js
      "prependCustom": false,
      "removeDuplicates": true,
      "whitelist": []
    }
  }
};