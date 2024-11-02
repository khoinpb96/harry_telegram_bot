import { chromium } from "playwright";

const TIME_OUT = 30000; // 30 seconds
export default class ScreenshotService {
  public async captureTradingViewChart(symbol: string, interval: string) {
    console.log(
      "ScreenshotService - captureTradingViewChart",
      symbol,
      interval
    );

    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({
      width: 1600,
      height: 800,
    });

    await page.goto(
      `https://www.tradingview.com/chart/?symbol=${symbol}&interval=${interval}`,
      {
        waitUntil: "networkidle",
        timeout: TIME_OUT,
      }
    );

    await page.waitForSelector(".chart-container", {
      timeout: TIME_OUT,
    });

    const screenshot = await page
      .locator(".chart-container")
      .screenshot({ type: "png" });

    // Ensure cleanup
    if (page) await page.close();
    if (browser) await browser.close();

    return screenshot;
  }
}
