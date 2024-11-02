import { Logger } from "@/utils";
import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "playwright";

const DEFAULT_TIMEOUT = 3 * 60 * 1000; // 3 minutes

export default class ScreenshotService {
  private logger = new Logger(ScreenshotService.name);
  private browser: Browser | undefined;
  private browserContext: BrowserContext | undefined;
  private page: Page | undefined;

  public async captureTradingViewChart(
    symbol: string,
    interval: string,
    timeout = DEFAULT_TIMEOUT
  ): Promise<Buffer> {
    const startAt = Date.now();

    try {
      if (!this.browser) {
        this.browser = await chromium.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu", // Can help with rendering issues
            "--disable-web-security", // May help with certain loading issues
          ],
        });
      }

      if (!this.browserContext) {
        this.browserContext = await this.browser.newContext({
          viewport: { width: 1600, height: 800 },
          deviceScaleFactor: 1,
          bypassCSP: true,
          ignoreHTTPSErrors: true,
        });
      }

      if (!this.page) {
        this.page = await this.browserContext.newPage();
      }

      this.logger.info(`Starting chart capture for ${symbol}`);

      await this.page.goto(
        `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(
          symbol
        )}&interval=${encodeURIComponent(interval)}`,
        {
          waitUntil: "networkidle",
          timeout: timeout / 2, // Split timeout between loading and rendering
        }
      );

      this.logger.info("Page loaded, waiting for chart at");

      await this.page.waitForSelector(".chart-container", {
        timeout,
        state: "visible",
      });

      this.logger.info("Chart loaded, taking screenshot at");

      const screenshot = await this.page
        .locator(".chart-container")
        .screenshot({
          type: "png",
          timeout: 30000, // Separate timeout for screenshot operation
        });

      this.logger.info(
        `Finish chart capture for ${symbol} in ${Date.now() - startAt}ms`
      );

      return screenshot;
    } catch (error) {
      this.logger.error(`Screenshot capture failed for ${symbol}:`, error);
      throw error;
    }
  }
}
