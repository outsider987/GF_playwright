import { chromium, Browser, Page, firefox, webkit } from 'playwright';
import dotenv from 'dotenv';

import { startEditPage } from './editProduct';
import { handleClodeModal, handleGoToPage } from './utils/handler';
import { globalState as globalConfigType, exportPath, routineState as initialRoutineStateType } from './config/base';
import * as fs from 'fs';
import { configPath } from '../config/bast';

dotenv.config();
export async function run(
    args: { routineState: typeof initialRoutineStateType; globalState: typeof globalConfigType },
    abortSignal: any,
) {
    const { ACCOUNT, PASSWORD } = process.env;
    const { routineState, globalState } = args;
    console.log(`Account: ${ACCOUNT}, Password: ${PASSWORD} \n 
    mode ${globalState.mode}
    `);
    const browser: Browser = await firefox.launch({
        headless: false,
        args: ['--disable-features=site-per-process'],
    });

    const context = await browser.newContext({
        // Set a random user agent string with each request
        // userAgent: await browser.userAgent(),
        // Emulate mouse and keyboard inputs to mimic human behavior
        // viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
        // Disable request interception to prevent breaking websites that rely on CSP
        bypassCSP: true,
    });
    try {
        // abortSignal.onabort(() => {
        //     browser.close();
        //     return 'tesr';
        // });
        // new Promise((resolve, reject) => {
        //     abortSignal.addEventListener('abort', () => {
        //         reject(new DOMException('Aborted', 'AbortError'));
        //     });
        // });

        const page: Page = await context.newPage();
        // Load cookies from file if it exists
        if (fs.existsSync(`${exportPath.cookies}/cookies.json`)) {
            const cookies = JSON.parse(fs.readFileSync(`${exportPath.cookies}/cookies.json`, 'utf8'));

            await context.addCookies(cookies);
            if (fs.existsSync(`${exportPath.cookies}/aliasCookies.json`)) {
                const aliasCookies = JSON.parse(fs.readFileSync(`${exportPath.cookies}/aliasCookies.json`, 'utf8'));
                await context.addCookies(aliasCookies);
            }

            await handleGoToPage({
                page,
                url: 'https://www.dianxiaomi.com/shopifyProduct/draft.htm?dxmState=draft',
                isignoreLoaded: true,
            });
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
            page.waitForLoadState('networkidle');

            const cookies = await page.context().cookies();
            if (!fs.existsSync(`${exportPath.cookies}`)) {
                fs.mkdirSync(`${exportPath.cookies}`);
            }
            fs.writeFileSync(`${exportPath.cookies}/cookies.json`, JSON.stringify(cookies, null, 2));

            await page.goto('https://www.dianxiaomi.com/shopifyProduct/draft.htm?dxmState=draft');
        }
        // await SelectAllEdit(page);

        await startEditPage(page, context, { routineState, globalState });
        await browser.close();
        console.log('end');
    } catch (error) {
        console.log('run error', error);
        if (context.pages().length === 0) return;
        error.isRunning ? browser.close() : await run(args, abortSignal);
    }
}
// run({ routineState: initialRoutineStateType, globalState: globalConfigType }, '');
