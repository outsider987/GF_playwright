import { chromium, Browser, Page, firefox, webkit } from 'playwright';
// import dotenv from 'dotenv';

import { startEditPage } from './editProduct';
import { handleCloseModal, handleGoToPage } from './utils/handler';
import {
    globalState as globalConfigType,
    exportPath,
    routineState as initialRoutineStateType,
    downloadState as downloadStateType,
    mode,
} from './config/base';
import * as fs from 'fs';
import { configPath } from '../config/base';
import { app } from 'electron';
import path from 'path';
import { startShopeEditPage } from './editProduct/shopeEdit';

// dotenv.config();
export async function run(args: {
    routineState: typeof initialRoutineStateType;
    globalState: typeof globalConfigType;
    downloadState: typeof downloadStateType;
}) {
    const { ACCOUNT, PASSWORD } = process.env;
    const { routineState, globalState, downloadState } = args;
    console.log(`Account: ${ACCOUNT}, Password: ${PASSWORD} \n 
    mode ${globalState.mode}
    `);
    const browser: Browser = await firefox.launch({
        headless: false,
        // args: ['--disable-features=site-per-process'],
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
    // Prevent DXM product notice modal from appearing at all
    try {
        await context.addInitScript(() => {
            (window as any).loadNotice = () => false;
        });
        await context.route('**/notice/showNotice.htm**', (route) => route.abort());
    } catch {}
    try {
        const isShope = globalState.mode === 'shope';
        const page: Page = await context.newPage();

        const documentsPath = app ? app.getPath('documents') : './';

        const cookiePath = path.join(documentsPath, exportPath.cookies);
        // await page.goto('https://www.dianxiaomi.com/index.htm', { timeout: 0 });
        if (fs.existsSync(`${cookiePath}/cookies.json`)) {
            const cookies = JSON.parse(fs.readFileSync(`${cookiePath}/cookies.json`, 'utf8'));

            await context.addCookies(cookies);
            if (fs.existsSync(`${cookiePath}/aliasCookies.json`)) {
                const aliasCookies = JSON.parse(fs.readFileSync(`${cookiePath}/aliasCookies.json`, 'utf8'));
                await context.addCookies(aliasCookies);
            }

            const rootPath = globalState.mode === 'routine' ? 'draft' : 'online';

            await handleGoToPage({
                page,
                url: isShope
                    ? `https://www.dianxiaomi.com/web/shopeeSite/draft`
                    : `https://www.dianxiaomi.com/web/shopifyProduct/${rootPath}`,
                isignoreLoaded: true,
            });
            await handleCloseModal(page);

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

            // Wait for user to complete login manually
            console.log('Waiting for user to complete login...');
            console.log('Please enter your credentials and complete the login process');

            // Wait for navigation after login (indicating successful login)
            await page.waitForNavigation({
                timeout: 0, // No timeout - wait indefinitely for user to login
                waitUntil: 'networkidle',
            });

            // Wait a bit more to ensure login is fully processed
            await page.waitForTimeout(2000);

            // Verify we're logged in by checking if we're redirected to a logged-in page
            const currentUrl = page.url();
            if (currentUrl.includes('index.htm') || currentUrl.includes('login')) {
                throw new Error('Login failed or incomplete. Please check your credentials.');
            }

            console.log('Login successful, saving cookies...');
            const cookies = await page.context().cookies();
            if (!fs.existsSync(`${cookiePath}`)) {
                fs.mkdirSync(`${cookiePath}`);
            }
            fs.writeFileSync(`${cookiePath}/cookies.json`, JSON.stringify(cookies, null, 2));

            // Navigate to the appropriate page after successful login
            const targetUrl = isShope
                ? `https://www.dianxiaomi.com/shopeeProduct/index.htm?dxmState=online`
                : 'https://www.dianxiaomi.com/web/shopifyProduct/draft';

            await page.goto(targetUrl);
            await page.waitForLoadState('domcontentloaded');
        }
        // await SelectAllEdit(page);
        await page.waitForLoadState('domcontentloaded');
        await handleCloseModal(page);
        isShope
            ? await startShopeEditPage(page, context, { routineState, globalState })
            : await startEditPage(page, context, { routineState, globalState, downloadState });
        await browser.close();

        console.log('end');
        return true;
    } catch (error) {
        console.log('run error', error);

        if (context.pages().length === 0) return false;
        await browser.close();
        return false;
        // if (error.isRunning) {
        //     browser.close()
        //     return false;
        // }
        // else
        //     return await run(args, abortSignal);
    }
}
run({ routineState: initialRoutineStateType, globalState: globalConfigType, downloadState: downloadStateType });
