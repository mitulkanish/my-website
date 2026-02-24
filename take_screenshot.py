import asyncio
from playwright.async_api import async_playwright

async def take_screenshot():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(set_viewport_size={"width": 1440, "height": 900})
        
        # Navigate to login
        await page.goto("http://localhost:5173/login")
        
        # Fill in admin credentials
        await page.fill("input[type='text']", "admin")
        await page.fill("input[type='password']", "admin123")
        await page.click("button[type='submit']")
        
        # Wait for dashboard to load
        await page.wait_for_selector(".grid-dashboard")
        
        # Wait a bit longer for charts to animate/render
        await page.wait_for_timeout(2000)
        
        # Take screenshot
        await page.screenshot(path="dashboard_screenshot.png")
        print("Screenshot saved to dashboard_screenshot.png")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(take_screenshot())
