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
           
            const validateImg = '#verifyImgCode';
            const validateSelector = '#verifyCode';
            const loginBtn = '#loginBtn';

            // Wait for all form elements to be available
            await page.waitForSelector(validateSelector);
            await page.waitForSelector(validateImg);
            await page.waitForSelector(loginBtn);
            await page.waitForSelector(validateSelector);

            // Find the input field by selector
                     
            // Wait for user to complete login manually
            console.log('Waiting for user to complete login...');
            console.log('Please enter your credentials and complete the login process');

            // Function to detect login success with comprehensive debugging
            const detectLoginSuccess = async (): Promise<boolean> => {
                try {
                    const currentUrl = page.url();
                    console.log('🔍 Checking login status...');
                    console.log('📍 Current URL:', currentUrl);
                    
                    // Get page title for additional context
                    const pageTitle = await page.title();
                    console.log('📄 Page title:', pageTitle);
                    
                    // Check URL patterns that indicate successful login
                    const urlIndicators = [
                        'home.htm',
                        'shopifyProduct',
                        'shopeeProduct',
                        'dashboard',
                        'main'
                    ];
                    
                    const hasLoginUrl = urlIndicators.some(indicator => {
                        const found = currentUrl.includes(indicator);
                        if (found) console.log(`✅ Found URL indicator: ${indicator}`);
                        return found;
                    });
                    
                    // Check for elements that only appear when logged in
                    const loggedInSelectors = [
                        '.user-info',
                        '.user-profile',
                        '.logout',
                        '.user-menu',
                        '[class*="user"]',
                        '[class*="profile"]',
                        '.avatar',
                        '.user-avatar',
                        '#userInfo',
                        '.login-success',
                        '.header-user',
                        '.user-dropdown',
                        '.account-info',
                        '.profile-menu'
                    ];
                    
                    let hasLoggedInElement = false;
                    console.log('🔍 Checking for logged-in elements...');
                    for (const selector of loggedInSelectors) {
                        try {
                            const element = await page.$(selector);
                            if (element) {
                                console.log(`✅ Found logged-in element: ${selector}`);
                                hasLoggedInElement = true;
                                break;
                            }
                        } catch (e) {
                            // Continue checking other selectors
                        }
                    }
                    
                    // Check if we're still on login page (this should be FALSE for success)
                    const stillOnLoginPage = currentUrl.includes('index.htm') || 
                                           currentUrl.includes('login') || 
                                           currentUrl.includes('signin');
                    
                    console.log('🔍 URL analysis:');
                    console.log(`  - Has login URL: ${hasLoginUrl}`);
                    console.log(`  - Has logged-in element: ${hasLoggedInElement}`);
                    console.log(`  - Still on login page: ${stillOnLoginPage}`);
                    
                    // Additional check: look for any text that indicates login success
                    let hasSuccessText = false;
                    try {
                        const bodyText = await page.textContent('body');
                        const successIndicators = [
                            '欢迎',
                            'welcome',
                            'dashboard',
                            '控制台',
                            'console',
                            '管理',
                            'manage',
                            '退出',
                            'logout',
                            '个人中心',
                            'profile'
                        ];
                        
                        hasSuccessText = successIndicators.some(indicator => 
                            bodyText && bodyText.toLowerCase().includes(indicator.toLowerCase())
                        );
                        
                        if (hasSuccessText) {
                            console.log('✅ Found success text in page content');
                        }
                    } catch (e) {
                        console.log('Error checking page content:', e);
                    }
                    
                    // STRICT LOGIN DETECTION - require at least one positive indicator AND not on login page
                    const isLoggedIn = !stillOnLoginPage && (hasLoginUrl || hasLoggedInElement || hasSuccessText);
                    
                    if (isLoggedIn) {
                        console.log('🎉 LOGIN SUCCESS DETECTED!');
                        return true;
                    }
                    
                    console.log('❌ No login indicators found or still on login page');
                    return false;
                } catch (error) {
                    console.log('❌ Error checking login status:', error);
                    return false;
                }
            };

            // Wait for login with timeout detection
            const maxWaitTime = 300000; // 5 minutes
            const checkInterval = 2000; // Check every 2 seconds
            const startTime = Date.now();
            
            let loginSuccessful = false;
            
            console.log('Starting login detection loop...');
            while (Date.now() - startTime < maxWaitTime) {
                loginSuccessful = await detectLoginSuccess();
                if (loginSuccessful) {
                    break;
                }
                
                const elapsed = Math.round((Date.now() - startTime) / 1000);
                console.log(`⏳ Login not yet successful, waiting... (${elapsed}s elapsed)`);
                await page.waitForTimeout(checkInterval);
            }
            
            if (!loginSuccessful) {
                throw new Error('❌ Login timeout after 5 minutes - please check your credentials and try again.');
            }

            console.log('Login successful, saving cookies...');
            const cookies = await page.context().cookies();
            console.log('Retrieved cookies count:', cookies.length);
            
            if (!fs.existsSync(`${cookiePath}`)) {
                fs.mkdirSync(`${cookiePath}`, { recursive: true });
            }
            fs.writeFileSync(`${cookiePath}/cookies.json`, JSON.stringify(cookies, null, 2));
            console.log('Cookies saved successfully to:', `${cookiePath}/cookies.json`);

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
