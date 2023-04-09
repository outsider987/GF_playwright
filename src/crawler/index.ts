import { chromium, Browser, Page, firefox, webkit } from 'playwright';
import dotenv from 'dotenv';
import * as fs from 'fs';
import { startEditPage } from './editProduct';
import { handleClodeModal, handleGoToPage } from './utils/handler';
import { config } from './config/base';
const http = require('http');

dotenv.config();
async function run() {
    try {
        const { ACCOUNT, PASSWORD } = process.env;

        console.log(`Account: ${ACCOUNT}, Password: ${PASSWORD}`);
        const browser: Browser = await chromium.launch({
            headless: false,
            args: ['--disable-features=site-per-process'],
        });

        const context = await browser.newContext({
            // Set a random user agent string with each request
            // userAgent: await browser.userAgent(),
            // Emulate mouse and keyboard inputs to mimic human behavior
            viewport: { width: 1920, height: 1080 },
            deviceScaleFactor: 1,
            hasTouch: false,
            isMobile: false,
            // Disable request interception to prevent breaking websites that rely on CSP
            bypassCSP: true,
        });
        const page: Page = await context.newPage();
        // Load cookies from file if it exists
        if (fs.existsSync('temp/cookies.json')) {
            const cookies = JSON.parse(fs.readFileSync('temp/cookies.json', 'utf8'));
            if (fs.existsSync('temp/aliasCookies.json')) {
                const aliasCookies = JSON.parse(fs.readFileSync('temp/aliasCookies.json', 'utf8'));
                await context.addCookies(aliasCookies);
            }

            await context.addCookies(cookies);

            await handleGoToPage({ page, url: 'https://www.dianxiaomi.com/shopifyProduct/draft.htm?dxmState=draft' });
            // await page.goto('https://www.dianxiaomi.com/shopifyProduct/draft.htm?dxmState=draft');
        } else {
            await page.goto('https://www.dianxiaomi.com/index.htm');

            console.log('start wait input name');
            const accountSelector = '#exampleInputName';
            const passSelector = '#exampleInputPassword';
            const validateImg = '#loginImgVcode';
            const validateSelector = '#loginVerifyCode';
            const loginBtn = '#loginBtn';

            await page.waitForSelector(accountSelector);
            await page.waitForSelector(passSelector);
            await page.waitForSelector(validateImg);
            await page.waitForSelector(loginBtn);
            await page.waitForSelector(validateSelector);

            // Find the input field by selector
            console.log('start find input name');
            const inputField = await page.$(accountSelector);
            const passField = await page.$(passSelector);
            const validateImgField = await page.$(validateImg);
            const loginBtnField = await page.$(loginBtn);
            const validateField = await page.$(validateSelector);

            // Take a screenshot of the element
            console.log('start screenshot');
            const screenshotBuffer = await validateImgField.screenshot();

            // Save the screenshot to a file
            const filename = 'temp/screenshot.png';
            require('fs').writeFileSync(filename, screenshotBuffer);

            // Set the value of the input field
            await inputField.fill(ACCOUNT);
            await passField.fill(PASSWORD);

            // Open a new tab
            const ImageTotextPage: Page = await browser.newPage();
            ImageTotextPage.goto('https://www.imagetotext.info/');

            const sunbmitSelector = '#jsShadowRoot';
            // const sunbmitSelector = `//*[contains(text(), 'Submit')]`
            const uploadSelector = '.browse-btn';
            const resultSelector = '.response-result.js-to-copy';
            const afterSetUpSelector = '.before-upload.upload-area.d-none';

            await ImageTotextPage.waitForSelector(uploadSelector);
            await ImageTotextPage.waitForSelector(sunbmitSelector);

            const fileInput = await ImageTotextPage.$('#file');
            await fileInput.setInputFiles('./temp/screenshot.png');
            //
            const submitElement = await ImageTotextPage.$(sunbmitSelector);
            const uploadElement = await ImageTotextPage.$(uploadSelector);

            console.log('start upload number image file');
            await submitElement?.click();

            await ImageTotextPage.waitForSelector(resultSelector, { timeout: 100000 });
            const resultElement = await ImageTotextPage.$(resultSelector);

            const trimResult = (await resultElement?.innerText()).replace(/\s+/g, '');
            await validateField.fill(trimResult);
            console.log('validate code is :', trimResult);
            await ImageTotextPage.close();

            console.log('start login');
            await loginBtnField?.click();
            await page.waitForNavigation();

            const cookies = await page.context().cookies();
            fs.writeFileSync('temp/cookies.json', JSON.stringify(cookies, null, 2));

            await page.goto('https://www.dianxiaomi.com/shopifyProduct/draft.htm?dxmState=draft');
        }
        // await SelectAllEdit(page);

        await startEditPage(page, context, config);
        await browser.close();
    } catch (error) {
        console.log('run error', error);

        await run();
    }
}

run();
