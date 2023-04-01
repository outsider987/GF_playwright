import { chromium, Browser, Page } from 'playwright';
import dotenv from 'dotenv';
import * as fs from 'fs';
const http = require('http');

dotenv.config();
async function run() {
    const filePath = './temp/validate.png';
    const { ACCOUNT, PASSWORD } = process.env;
    console.log(`Account: ${ACCOUNT}, Password: ${PASSWORD}`);
    const browser: Browser = await chromium.launch({ headless: false });

    const context = await browser.newContext();
    const page: Page = await context.newPage();
    // Load cookies from file if it exists
    if (fs.existsSync('temp/cookies.json')) {
        const cookies = JSON.parse(fs.readFileSync('temp/cookies.json', 'utf8'));
        debugger;
        await context.addCookies(cookies);
        await page.goto('https://www.dianxiaomi.com/shopifyProduct/draft.htm?dxmState=draft');
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

    await browser.close();
}

run();
