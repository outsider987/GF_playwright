const { keyFrames, animates } = require('outsiderreact/dist/configs/tailwindAnimate');
const { LAYOUT_SIZE } = require('./src/utils/canvas/constants');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html', './node_modules/outsiderreact/dist/**/*.{ts,js}'],

  theme: {
    extend: {
      colors: {
        greyscale: '#181818',
        navbar: '#1B1B1B',
        navBarUnFocusBlue: '#00D1FF',
        inputFcous: '#FF9B33',
        slider_bar_l: '#FF5C01',
        slider_bar_r: '#FFD25F',
      },
      spacing: {
        'navbar-desktop-w': '5rem',
        'm-navbar-desktop-h': '8vh',
        navbar_desktop_w: '15rem',
        'panel-width': LAYOUT_SIZE.PANEL_WIDTH,
        'menu-width': LAYOUT_SIZE.MENU_WIDTH,
      },
      maxWidth: {
        navbar_desktop_w: '15rem',
      },

      fontFamily: {
        opensans: ['Open Sans', 'sans-serif'],
      },
      screens: {
        sm: '280px',
      },
      keyframes: {
        ...keyFrames,
        fade_in: {
          '0%': { opacity: 0 },
          '100%': { opacity: 100 },
        },
        menu_collpase_on: {
          '0%': { height: '0vh', opacity: 0 },
          '100%': { height: '50vh', opacity: 100 },
        },
        menu_collpase_off: {
          '0%': { height: '50vh', opacity: 100 },
          '100%': { height: '0vh', opacity: 0 },
        },
        pop: {
          '0%': { marginBottom: '15vh', opacity: 0 },
          '100%': { marginBottom: '0vh', opacity: 100 },
        },
      },
      animation: {
        ...animates,
        menu_collpase_on: 'menu_collpase_on 0.5s ease-in ',
        menu_collpase_off: 'menu_collpase_off 0.5s ease-in ',
        fade_in: 'fade_in 0.2s ease-in ',
        pop: 'pop 0.2s ease-in',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
