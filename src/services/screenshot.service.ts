import type { ScreenshotServiceABC } from "@/services/base.service";
import { ServiceError } from "@/utils";
import puppeteer from "puppeteer";

export default class ScreenshotService implements ScreenshotServiceABC {
  private logger = {
    info: (message: string) => console.log(`[ScreenshotService] ${message}`),
    error: (message: string, error?: Error) =>
      console.error(`[ScreenshotService] ${message}`, error),
  };

  constructor(private webdriver = puppeteer) {}

  public async captureTradingViewChart(symbol: string, interval: string) {
    const browser = await this.webdriver.launch();
    this.logger.info("Browser conntected");

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    const url = `https://www.tradingview.com/chart/?symbol=${symbol}&interval=${interval}`;
    const res = await page.goto(url, { waitUntil: "networkidle0" });
    await page.waitForSelector(".chart-container", { timeout: 10000 });

    if (!res?.ok) {
      console.error(`ScreenshotService - Cannot load ${symbol} chart`, url);
      throw new ServiceError(`Cannot load ${symbol} chart`, 500);
    }

    const chart = await page.$(".chart-container");
    if (!chart) {
      throw new ServiceError("Cannot select chart-container", 500);
    }

    this.logger.info(`Capturing chart for ${symbol}`);
    return Buffer.from(await chart.screenshot());
  }
}
