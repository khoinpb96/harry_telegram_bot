import { Logger } from "@/utils";
import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "playwright";

const DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export default class ScreenshotService {
  private logger = new Logger(ScreenshotService.name);
  private browser: Browser | undefined;
  private browserContext: BrowserContext | undefined;

  private async getContext() {
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
        viewport: { width: 1200, height: 600 },
        bypassCSP: true,
        ignoreHTTPSErrors: true,
      });
    }

    return this.browserContext;
  }

  public async captureTradingViewChart(
    symbol: string,
    interval: string,
    timeout = DEFAULT_TIMEOUT
  ): Promise<Buffer> {
    const startAt = Date.now();
    this.logger.info(`Starting chart capture for ${symbol}`);

    try {
      const context = await this.getContext();
      const page = await context.newPage();

      // Enable request interception to block unnecessary resources
      await page.route("**/*", async (route) => {
        const request = route.request();
        // Block unnecessary resource types
        if (
          ["image", "media", "font", "other"].includes(request.resourceType())
        ) {
          if (!request.url().includes("chart")) {
            await route.abort();
            return;
          }
        }

        await route.continue();
      });

      await page.goto(
        `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(
          symbol
        )}&interval=${encodeURIComponent(interval)}`,
        {
          waitUntil: "domcontentloaded",
          timeout,
        }
      );

      this.logger.info("Navigated to chart");

      await page.waitForSelector(".chart-container", {
        timeout,
        state: "visible",
      });

      this.logger.info("Chart loaded");

      const screenshot = await page.locator(".chart-container").screenshot({
        type: "jpeg",
        timeout,
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
