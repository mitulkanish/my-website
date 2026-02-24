import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log("Navigating to login...");
    await page.goto('http://localhost:5173/login');

    console.log("Entering credentials...");
    await page.type('input[type="text"]', 'admin');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    console.log("Waiting for dashboard to render...");
    // Wait for the main grid to appear
    await page.waitForSelector('.grid-dashboard', { timeout: 10000 });

    // Wait an extra 2 seconds for Recharts animations to finish
    await new Promise(r => setTimeout(r, 2000));

    console.log("Taking screenshot...");
    await page.screenshot({ path: 'dashboard_screenshot.png' });

    console.log("Success! Saved to dashboard_screenshot.png");
    await browser.close();
})();
