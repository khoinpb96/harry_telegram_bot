import type { ScreenshotServiceABC } from "@/services/base.service";
import { ServiceError } from "@/utils";
import puppeteer from "puppeteer";

export default class ScreeshotService implements ScreenshotServiceABC {
  constructor(private webdriver = puppeteer) {}

  public async captureTradingViewChart(symbol: string, interval: string) {
    const browser = await this.webdriver.launch({
      browser: "chrome",
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
        "--disable-software-rasterizer",
      ],
    });
    console.log(`Connected: ${browser.connected}`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    const url = `https://www.tradingview.com/chart/?symbol=${symbol}&interval=${interval}`;
    const res = await page.goto(url, { waitUntil: "networkidle0" });
    await page.waitForSelector(".chart-container", { timeout: 10000 });

    if (!res?.ok) {
      console.error(`ScreeshotService - Cannot load ${symbol} chart`, url);
      throw new ServiceError(`Cannot load ${symbol} chart`, 500);
    }

    console.log("ScreeshotService - getting chart");
    const chart = await page.$(".chart-container");
    if (!chart) {
      throw new ServiceError("Cannot select chart-container", 500);
    }

    console.log("ScreeshotService - screenshoting");
    return Buffer.from(await chart.screenshot());
  }
}
