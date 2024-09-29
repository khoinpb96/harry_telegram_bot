import * as dtos from "@/dtos";

export abstract class TelegramServiceABC {
  abstract handleMessage(message: dtos.TelegramWebhookBodyDTO): Promise<any>;
}

export abstract class ScreenshotServiceABC {
  abstract captureTradingViewChart(
    symbol: string,
    interval: string
  ): Promise<Buffer>;
}
